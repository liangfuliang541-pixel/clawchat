import { Router } from 'express';
import {
  registerHermesAgent,
  listHermesAgents,
  triggerHermesAgent,
} from '../controllers/hermesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, listHermesAgents);
router.post('/register', authMiddleware, registerHermesAgent);
router.post('/trigger', authMiddleware, triggerHermesAgent);

export default router;
