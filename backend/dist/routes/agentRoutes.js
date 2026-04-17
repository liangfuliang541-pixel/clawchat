import { Router } from 'express';
import { registerAgent, sendMessage, getAgents } from '../controllers/agentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { agentAuthMiddleware } from '../middleware/agentAuth.js';
const router = Router();
// Public list of agents
router.get('/', getAgents);
// Register a new agent (human auth required)
router.post('/register', authMiddleware, registerAgent);
// Agent sends a message (API key auth required)
router.post('/message', agentAuthMiddleware, sendMessage);
export default router;
