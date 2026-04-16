import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { mockDB } from '../config/mockDatabase.js';

export interface AuthRequest extends Request {
  userId?: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me-in-production';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    const user =
      process.env.USE_MOCK_DB === 'true'
        ? await mockDB.findById(decoded.userId)
        : await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.userId = (user._id.toString?.() || user._id) as string;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
