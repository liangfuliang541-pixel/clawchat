import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { ServerToClientEvents, ClientToServerEvents } from '@clawchat/shared';
import { userRepository } from '../repositories/index.js';
import { logger } from '../config/logger.js';
import { getJwtSecret } from '../config/auth.js';

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  userId?: string;
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    // Try JWT token first (human users)
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token && typeof token === 'string') {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
      socket.userId = decoded.userId;
      return next();
    }

    // Try API key (agents)
    const apiKey = socket.handshake.auth?.apiKey || socket.handshake.query?.apiKey;
    if (apiKey && typeof apiKey === 'string') {
      const agent = await userRepository.findByApiKey(apiKey);
      if (agent && agent.kind === 'agent') {
        socket.userId = (agent._id.toString?.() || agent._id) as string;
        return next();
      }
    }

    next(new Error('Authentication required'));
  } catch (err) {
    logger.warn({ socketId: socket.id, err }, 'Socket authentication failed');
    next(new Error('Invalid token'));
  }
};
