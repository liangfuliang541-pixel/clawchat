import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@clawchat/shared';
import { logger } from '../config/logger.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import type { AuthenticatedSocket } from './auth.js';

export { socketAuthMiddleware } from './auth.js';

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info({ socketId: socket.id }, 'Socket connected');

    // Middleware to extract userId from query params (client sends it on connection)
    socket.userId = socket.handshake.query.userId as string;

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      logger.info(
        { socketId: socket.id, conversationId, userId: socket.userId },
        'Joined conversation'
      );

      // Notify others in the room
      socket.to(conversationId).emit('user_status_changed', {
        userId: socket.userId || 'unknown',
        status: 'online',
      });
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      logger.info({ socketId: socket.id, conversationId }, 'Left conversation');

      // Notify others in the room
      socket.to(conversationId).emit('user_status_changed', {
        userId: socket.userId || 'unknown',
        status: 'away',
      });
    });

    socket.on('send_message', async (payload) => {
      try {
        if (!socket.userId) {
          logger.warn({ socketId: socket.id }, 'Message sent without userId');
          return;
        }

        // Persist message to database
        const message = await Message.create({
          sender: socket.userId,
          receiver: payload.receiver || socket.userId, // For group conversations
          conversationId: payload.conversationId,
          content: payload.content,
          type: payload.type || 'text',
          fileUrl: payload.fileUrl,
          isRead: false,
        });

        // Populate sender info
        const populatedMessage = await message.populate('sender', 'username avatar');

        // Format response
        const messageResponse = {
          _id: message._id.toString(),
          sender: message.sender.toString(),
          receiver: message.receiver.toString(),
          conversationId: message.conversationId,
          content: message.content,
          type: message.type,
          fileUrl: message.fileUrl,
          isRead: message.isRead,
          createdAt: message.createdAt.toISOString(),
        };

        // Update conversation's lastMessage
        await Conversation.findByIdAndUpdate(payload.conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        // Broadcast to room members
        io.to(payload.conversationId).emit('receive_message', messageResponse);
        logger.info(
          { messageId: message._id, conversationId: payload.conversationId },
          'Message broadcasted'
        );
      } catch (err) {
        logger.error({ err, payload }, 'Failed to send message');
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (payload) => {
      socket.to(payload.conversationId).emit('user_typing', {
        conversationId: payload.conversationId,
        userId: socket.userId || 'unknown',
      });
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id, userId: socket.userId }, 'Socket disconnected');
    });
  });
};
