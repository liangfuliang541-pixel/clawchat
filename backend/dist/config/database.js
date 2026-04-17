import mongoose from 'mongoose';
import { logger } from './logger.js';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clawchat';
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('✅ MongoDB connected');
    }
    catch (err) {
        logger.error({ err }, '❌ MongoDB connection failed');
        process.exit(1);
    }
};
