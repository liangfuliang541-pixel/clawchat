import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@clawchat/shared';
import { logger } from '../config/logger.js';
import { messageService } from '../services/index.js';
import { hermesBridgeService, HermesBridgeService } from '../services/HermesBridgeService.js';
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

        // 🐎 Hermes Agent auto-trigger
        // Check if message @mentions an agent or if any agent has autoReply enabled
        await maybeTriggerHermesAgent(io, payload.conversationId, userId);
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

/**
 * Check if any Hermes Agent should respond to the latest message.
 * Triggered when a user sends a message containing @agent
 * or when an agent has autoReply enabled.
 */
async function maybeTriggerHermesAgent(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  conversationId: string,
  senderUserId: string
) {
  const agents = hermesBridgeService.getAgents();
  if (agents.length === 0) return;

  // Get the conversation history
  const historyResult = await messageService.getHistory(conversationId, 50);
  const messages = historyResult.items;

  const latestMessage = messages[messages.length - 1];
  if (!latestMessage) return;

  const latestContent = latestMessage.content.toLowerCase();

  const triggers = agents
    .filter((a) => a.enabled)
    .filter((a) => {
      const shouldTrigger =
        latestContent.includes(`@${a.name.toLowerCase()}`) ||
        latestContent.includes('@agent') ||
        a.autoReply;
      return shouldTrigger;
    })
    .map(async (agentConfig) => {
      let agentUser = await userRepository.findByUsername(agentConfig.name);
      if (!agentUser) {
        agentUser = await userRepository.create({
          username: agentConfig.name,
          kind: 'agent',
          agentType: 'hermes',
          email: `${agentConfig.name}@hermes.local`,
          avatar: '',
          bio: `Hermes Agent — ${agentConfig.baseUrl}`,
          status: 'online',
        });
      }

      const agentUserId = (agentUser._id.toString?.() || agentUser._id) as string;
      const chatHistory = HermesBridgeService.buildHistory(messages, senderUserId, agentUserId);

      logger.info({ agent: agentConfig.name, conversationId }, 'Triggering Hermes Agent response');

      io.to(conversationId).emit('user_typing', {
        conversationId,
        userId: agentUserId,
      });

      const content = await hermesBridgeService.invoke(
        agentConfig._id || agentConfig.name,
        conversationId,
        chatHistory
      );

      if (!content) {
        logger.warn({ agent: agentConfig.name }, 'Hermes Agent returned no content');
        return;
      }

      const reply = await messageService.sendMessage({
        senderId: agentUserId,
        conversationId,
        content,
        type: 'text',
      });

      io.to(conversationId).emit('receive_message', reply);
      logger.info(
        { messageId: reply._id, agent: agentConfig.name, conversationId },
        'Hermes Agent reply broadcasted'
      );
    });

  await Promise.all(triggers);
}
