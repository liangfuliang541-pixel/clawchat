import { Router } from 'express';
import { sendMessage, getMessages, markAsRead, markConversationAsRead, } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.post('/', authMiddleware, sendMessage);
router.get('/:conversationId', authMiddleware, getMessages);
router.put('/:messageId/read', authMiddleware, markAsRead);
router.put('/conversation/:conversationId/read', authMiddleware, markConversationAsRead);
export default router;
