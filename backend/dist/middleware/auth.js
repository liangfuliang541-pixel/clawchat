import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { mockDB } from '../config/mockDatabase.js';
const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const decoded = jwt.verify(token, getJwtSecret());
        const user = process.env.USE_MOCK_DB === 'true'
            ? await mockDB.findById(decoded.userId)
            : await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        req.userId = (user._id.toString?.() || user._id);
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
