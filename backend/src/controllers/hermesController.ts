import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hermesBridgeService } from '../services/HermesBridgeService.js';
import { logger } from '../config/logger.js';

const registerSchema = z.object({
  name: z.string().min(1).max(50),
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().optional(),
  enabled: z.boolean().default(true),
  autoReply: z.boolean().default(false),
  systemPrompt: z.string().optional(),
});

export const registerHermesAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const id = crypto.randomUUID();
    hermesBridgeService.register({ _id: id, ...data });
    res.status(201).json({ success: true, data: { id, ...data, apiKey: '***' } });
  } catch (err) {
    logger.error({ err }, 'Register Hermes agent failed');
    next(err);
  }
};

export const listHermesAgents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = hermesBridgeService.getAgents().map((a) => ({ ...a, apiKey: '***' }));
    res.json({ success: true, data: agents });
  } catch (err) {
    logger.error({ err }, 'List Hermes agents failed');
    next(err);
  }
};

export const triggerHermesAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, conversationId, history } = req.body;
    if (!agentId || !conversationId || !Array.isArray(history)) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }
    const content = await hermesBridgeService.invoke(agentId, conversationId, history);
    res.json({ success: true, data: { content } });
  } catch (err) {
    logger.error({ err }, 'Trigger Hermes agent failed');
    next(err);
  }
};
