import { Redis } from 'ioredis';
import { logger } from './logger.js';
const REDIS_URI = process.env.REDIS_URI || 'redis://localhost:6379';
export const redis = new Redis(REDIS_URI, {
    retryStrategy: (times) => {
        if (times > 3) {
            logger.error('Redis connection failed after 3 retries');
            return null;
        }
        return Math.min(times * 100, 3000);
    },
});
redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));
