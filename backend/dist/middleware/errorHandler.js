import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        logger.warn({ statusCode: err.statusCode, code: err.code, message: err.message }, 'Application error');
        res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            details: err.details,
        });
        return;
    }
    if (err instanceof ZodError) {
        const details = err.errors.reduce((acc, e) => {
            acc[e.path.join('.')] = e.message;
            return acc;
        }, {});
        logger.warn({ details }, 'Validation error');
        res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
        });
        return;
    }
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: err.message || 'Internal Server Error',
    });
};
