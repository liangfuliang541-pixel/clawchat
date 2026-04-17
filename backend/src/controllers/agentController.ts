import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { agentService } from '../services/AgentService.js';
import { logger } from '../config/logger.js';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  agentType: z.string().min(1).max(50),
  avatar: z.string().optional(),
  bio: z.string().max(500).optional(),
});

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image', 'file']).optional(),
});

export const registerAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await agentService.registerAgent(data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    logger.error({ err }, 'Register agent failed');
    next(err);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = sendMessageSchema.parse(req.body);
    const agentId = (req as any).agentId as string;
    const message = await agentService.sendMessage(agentId, data);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    logger.error({ err }, 'Agent send message failed');
    next(err);
  }
};

export const getAgents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await agentService.getAgents();
    res.json({ success: true, data: agents });
  } catch (err) {
    logger.error({ err }, 'Get agents failed');
    next(err);
  }
};
