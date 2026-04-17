import type { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/index.js';
import { logger } from '../config/logger.js';

export interface AgentAuthRequest extends Request {
  agentId?: string;
}

export const agentAuthMiddleware = async (
  req: AgentAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string | undefined;
    if (!apiKey) {
      res.status(401).json({ success: false, message: 'API key required' });
      return;
    }

    // Find agent by API key (we need to check all agents - in prod this should use a hash lookup)
    const agent = await userRepository.findByApiKey(apiKey);
    if (!agent || agent.kind !== 'agent') {
      res.status(401).json({ success: false, message: 'Invalid API key' });
      return;
    }

    req.agentId = (agent._id.toString?.() || agent._id) as string;
    next();
  } catch (err) {
    logger.error({ err }, 'Agent auth failed');
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};
