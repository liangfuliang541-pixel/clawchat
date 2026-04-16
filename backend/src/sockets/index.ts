import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@clawchat/shared';
import { logger } from '../config/logger.js';
import { messageService } from '../services/index.js';
import { userRepository } from '../repositories/index.js';
import type { AuthenticatedSocket } from './auth.js';

export { socketAuthMiddleware } from './auth.js';

const typingThrottles = new Map<string, ReturnType<typeof setTimeout>>();

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info({ socketId: socket.id, userId }, 'Socket connected');

    socket.broadcast.emit('user_status_changed', { userId, status: 'online' });
    userRepository.updateStatus(userId, 'online').catch(() => {});

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      logger.info({ socketId: socket.id, conversationId, userId }, 'Joined conversation');
      socket.to(conversationId).emit('user_status_changed', { userId, status: 'online' });

      messageService
        .getHistory(conversationId, 50)
        .then((result) => {
          const unread = result.items.filter((m) => m.sender !== userId && !m.isRead);
          if (unread.length > 0) {
            socket.emit('unread_messages', { conversationId, messages: unread });
          }
        })
        .catch(() => {});
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      logger.info({ socketId: socket.id, conversationId, userId }, 'Left conversation');
      socket.to(conversationId).emit('user_status_changed', { userId, status: 'away' });
    });

    socket.on('send_message', async (payload) => {
      try {
        const message = await messageService.sendMessage({
          senderId: userId,
          conversationId: payload.conversationId,
          content: payload.content,
          type: payload.type || 'text',
        });

        io.to(payload.conversationId).emit('receive_message', message);
        logger.info(
          { messageId: message._id, conversationId: payload.conversationId },
          'Message broadcasted'
        );
      } catch (err) {
        logger.error({ err, payload }, 'Failed to send message');
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('read_message', async (payload) => {
      try {
        await messageService.markAsRead(payload.messageId);
        io.to(payload.conversationId).emit('message_read', {
          messageId: payload.messageId,
          conversationId: payload.conversationId,
          userId,
        });
      } catch (err) {
        logger.error({ err }, 'Failed to mark message as read');
      }
    });

    socket.on('typing', (payload) => {
      const key = `${userId}:${payload.conversationId}`;
      if (typingThrottles.has(key)) return;

      socket.to(payload.conversationId).emit('user_typing', {
        conversationId: payload.conversationId,
        userId,
      });

      const timer = setTimeout(() => typingThrottles.delete(key), 200);
      typingThrottles.set(key, timer);
    });

    socket.on('disconnect', async () => {
      logger.info({ socketId: socket.id, userId }, 'Socket disconnected');
      socket.broadcast.emit('user_status_changed', { userId, status: 'offline' });
      await userRepository.updateStatus(userId, 'offline').catch(() => {});
    });
  });
};
