import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';
import { mockDB } from '../config/mockDatabase.js';
import type { ApiResponse, AuthResponse } from '@clawchat/shared';

const JWT_EXPIRES_IN = '7d';
const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me';


const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signToken = (userId: string) => jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });

const toUserResponse = (user: any): any => ({
  _id: user._id.toString?.() || user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  status: user.status,
  createdAt: user.createdAt?.toISOString?.() || user.createdAt,
  updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    let user: any;
    if (process.env.USE_MOCK_DB === 'true') {
      user = await mockDB.createUser(data);
    } else {
      const exists = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
      if (exists) {
        res.status(409).json({ success: false, message: 'User already exists' } as ApiResponse<null>);
        return;
      }
      user = await User.create(data);
    }

    const token = signToken(user._id.toString?.() || user._id);
    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: { user: toUserResponse(user), token },
    };
    res.status(201).json(response);
  } catch (err) {
    logger.error({ err }, 'Register failed');
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
      return;
    }
    if ((err as Error).message === 'User already exists') {
      res.status(409).json({ success: false, message: 'User already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    let user: any;
    let valid = false;
    if (process.env.USE_MOCK_DB === 'true') {
      user = await mockDB.findByEmail(data.email);
      valid = user ? await mockDB.comparePassword(user._id, data.password) : false;
      if (user) await mockDB.updateStatus(user._id, 'online');
    } else {
      user = await User.findOne({ email: data.email }).select('+password');
      valid = user ? await user.comparePassword(data.password) : false;
      if (user) {
        user.status = 'online';
        await user.save();
      }
    }

    if (!user || !valid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' } as ApiResponse<null>);
      return;
    }

    const token = signToken(user._id.toString?.() || user._id);
    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: { user: toUserResponse(user), token },
    };
    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Login failed');
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
      return;
    }
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;

    let user: any;
    if (process.env.USE_MOCK_DB === 'true') {
      user = await mockDB.findById(userId);
    } else {
      user = await User.findById(userId).select('-password');
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const response: ApiResponse<any> = {
      success: true,
      data: toUserResponse(user),
    };
    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Get profile failed');
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
