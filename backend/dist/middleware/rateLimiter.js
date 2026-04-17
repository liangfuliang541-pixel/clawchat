import rateLimit from 'express-rate-limit';
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.ip || 'unknown'),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later.',
        });
    },
    // Redis store would need rate-limit-redis package; fallback to memory store for now
});
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            code: 'RATE_LIMITED',
            message: 'Too many authentication attempts, please try again later.',
        });
    },
});
