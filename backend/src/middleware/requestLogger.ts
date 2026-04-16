import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../config/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  (req as any).requestId = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      },
      `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
