import { userRepository } from '../repositories/index.js';
import { logger } from '../config/logger.js';
export const agentAuthMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
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
        req.agentId = (agent._id.toString?.() || agent._id);
        next();
    }
    catch (err) {
        logger.error({ err }, 'Agent auth failed');
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};
