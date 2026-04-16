import { Router } from 'express';
import {
  createPrivate,
  createGroup,
  getConversations,
  addParticipant,
  removeParticipant,
} from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/private', authMiddleware, createPrivate);
router.post('/group', authMiddleware, createGroup);
router.get('/', authMiddleware, getConversations);
router.post('/:conversationId/members', authMiddleware, addParticipant);
router.delete('/:conversationId/members', authMiddleware, removeParticipant);

export default router;
