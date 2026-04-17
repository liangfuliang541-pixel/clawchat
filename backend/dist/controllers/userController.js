import { userService } from '../services/index.js';
import { logger } from '../config/logger.js';
export const searchUsers = async (req, res, next) => {
    try {
        const keyword = req.query.q || '';
        const users = await userService.searchUsers(keyword);
        res.json({ success: true, data: users });
    }
    catch (err) {
        logger.error({ err }, 'Search users failed');
        next(err);
    }
};
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await userService.updateProfile(userId, req.body);
        res.json({ success: true, data: user });
    }
    catch (err) {
        logger.error({ err }, 'Update profile failed');
        next(err);
    }
};
