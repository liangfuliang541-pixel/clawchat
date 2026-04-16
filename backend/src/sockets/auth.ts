import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { ServerToClientEvents, ClientToServerEvents } from '@clawchat/shared';
import { logger } from '../config/logger.js';

export interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  userId?: string;
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required'));
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string };
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    logger.warn({ socketId: socket.id, err }, 'Socket authentication failed');
    next(new Error('Invalid token'));
  }
};
