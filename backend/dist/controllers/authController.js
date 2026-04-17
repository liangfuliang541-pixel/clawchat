import { authService } from '../services/index.js';
import { logger } from '../config/logger.js';
export const register = async (req, res, next) => {
    try {
        const response = await authService.register(req.body);
        res.status(201).json(response);
    }
    catch (err) {
        logger.error({ err }, 'Register failed');
        next(err);
    }
};
export const login = async (req, res, next) => {
    try {
        const response = await authService.login(req.body);
        res.json(response);
    }
    catch (err) {
        logger.error({ err }, 'Login failed');
        next(err);
    }
};
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const response = await authService.getProfile(userId);
        res.json(response);
    }
    catch (err) {
        logger.error({ err }, 'Get profile failed');
        next(err);
    }
};
