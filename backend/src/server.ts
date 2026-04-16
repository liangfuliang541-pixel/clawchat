import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/database.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import { registerSocketHandlers } from './sockets/index.js';

dotenv.config();

// 全局JWT Secret - 确保一致性
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
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
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString(), dbMode: USE_MOCK ? 'mock' : 'mongo' } });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Sockets
registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;

const start = async () => {
  if (!USE_MOCK) {
    await connectDB();
  } else {
    logger.info('🧪 Running with MOCK database (USE_MOCK_DB=true)');
  }
  httpServer.listen(PORT, '127.0.0.1', () => {
    logger.info(`🦞 ClawChat backend running on http://localhost:${PORT}`);
  });
};

start();
