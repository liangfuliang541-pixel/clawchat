import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.register(req.body);
    res.status(201).json(response);
  } catch (err) {
    logger.error({ err }, 'Register failed');
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await authService.login(req.body);
    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Login failed');
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const response = await authService.getProfile(userId);
    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Get profile failed');
    next(err);
  }
};
