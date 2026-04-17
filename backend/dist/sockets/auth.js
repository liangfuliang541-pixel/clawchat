import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/index.js';
import { logger } from '../config/logger.js';
const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
export const socketAuthMiddleware = async (socket, next) => {
    try {
        // Try JWT token first (human users)
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (token && typeof token === 'string') {
            const decoded = jwt.verify(token, getJwtSecret());
            socket.userId = decoded.userId;
            return next();
        }
        // Try API key (agents)
        const apiKey = socket.handshake.auth?.apiKey || socket.handshake.query?.apiKey;
        if (apiKey && typeof apiKey === 'string') {
            const agent = await userRepository.findByApiKey(apiKey);
            if (agent && agent.kind === 'agent') {
                socket.userId = (agent._id.toString?.() || agent._id);
                return next();
            }
        }
        next(new Error('Authentication required'));
    }
    catch (err) {
        logger.warn({ socketId: socket.id, err }, 'Socket authentication failed');
        next(new Error('Invalid token'));
    }
};
