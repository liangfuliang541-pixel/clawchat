import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { messageService } from '../services/index.js';
import { logger } from '../config/logger.js';

const sendSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image', 'file']).optional(),
  fileUrl: z.string().optional(),
});

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = sendSchema.parse(req.body);
    const userId = (req as any).userId as string;
    const message = await messageService.sendMessage({
      senderId: userId,
      ...data,
    });
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    logger.error({ err }, 'Send message failed');
    next(err);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.conversationId as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const before = (req.query.before as string) || undefined;
    const result = await messageService.getHistory(conversationId, limit, before);
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error({ err }, 'Get messages failed');
    next(err);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messageId = req.params.messageId as string;
    await messageService.markAsRead(messageId);
    res.json({ success: true, data: { messageId } });
  } catch (err) {
    logger.error({ err }, 'Mark as read failed');
    next(err);
  }
};

export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.conversationId as string;
    const userId = (req as any).userId as string;
    await messageService.markConversationAsRead(conversationId, userId);
    res.json({ success: true, data: { conversationId } });
  } catch (err) {
    logger.error({ err }, 'Mark conversation as read failed');
    next(err);
  }
};
