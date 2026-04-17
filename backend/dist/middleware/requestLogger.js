import { randomUUID } from 'crypto';
import { logger } from '../config/logger.js';
export const requestLogger = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    req.requestId = requestId;
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
        }, `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
};
