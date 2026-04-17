import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/database.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import hermesRoutes from './routes/hermesRoutes.js';
import { registerSocketHandlers, socketAuthMiddleware } from './sockets/index.js';

dotenv.config();

const USE_MOCK = process.env.USE_MOCK_DB === 'true';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dbMode: USE_MOCK ? 'mock' : 'mongo',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/hermes', hermesRoutes);

// Error handling
app.use(errorHandler);

// Sockets
io.use(socketAuthMiddleware);
registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';

const start = async () => {
  if (!USE_MOCK) {
    await connectDB();
  } else {
    logger.info('🧪 Running with MOCK database (USE_MOCK_DB=true)');
  }
  httpServer.listen(Number(PORT), HOST, () => {
    logger.info(`🦞 ClawChat backend running on http://${HOST}:${PORT}`);
  });
};

start();
