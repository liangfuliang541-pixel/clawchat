import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { friendshipService } from '../services/index.js';
import { logger } from '../config/logger.js';

const targetSchema = z.object({
  targetUserId: z.string().min(1),
});

export const sendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = targetSchema.parse(req.body);
    const userId = (req as any).userId as string;
    const result = await friendshipService.sendRequest(userId, data.targetUserId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    logger.error({ err }, 'Send friend request failed');
    next(err);
  }
};

export const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = targetSchema.parse(req.body);
    const userId = (req as any).userId as string;
    const result = await friendshipService.acceptRequest(userId, data.targetUserId);
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error({ err }, 'Accept friend request failed');
    next(err);
  }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = targetSchema.parse(req.body);
    const userId = (req as any).userId as string;
    await friendshipService.rejectRequest(userId, data.targetUserId);
    res.json({ success: true, data: { status: 'rejected' } });
  } catch (err) {
    logger.error({ err }, 'Reject friend request failed');
    next(err);
  }
};

export const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const friends = await friendshipService.getFriends(userId);
    res.json({ success: true, data: friends });
  } catch (err) {
    logger.error({ err }, 'Get friends failed');
    next(err);
  }
};

export const getPendingRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId as string;
    const requests = await friendshipService.getPendingRequests(userId);
    res.json({ success: true, data: requests });
  } catch (err) {
    logger.error({ err }, 'Get pending requests failed');
    next(err);
  }
};
