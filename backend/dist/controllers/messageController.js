import { z } from 'zod';
import { messageService } from '../services/index.js';
import { logger } from '../config/logger.js';
const sendSchema = z.object({
    conversationId: z.string().min(1),
    content: z.string().min(1).max(2000),
    type: z.enum(['text', 'image', 'file']).optional(),
    fileUrl: z.string().optional(),
});
export const sendMessage = async (req, res, next) => {
    try {
        const data = sendSchema.parse(req.body);
        const userId = req.userId;
        const message = await messageService.sendMessage({
            senderId: userId,
            ...data,
        });
        res.status(201).json({ success: true, data: message });
    }
    catch (err) {
        logger.error({ err }, 'Send message failed');
        next(err);
    }
};
export const getMessages = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const before = req.query.before || undefined;
        const result = await messageService.getHistory(conversationId, limit, before);
        res.json({ success: true, data: result });
    }
    catch (err) {
        logger.error({ err }, 'Get messages failed');
        next(err);
    }
};
export const markAsRead = async (req, res, next) => {
    try {
        const messageId = req.params.messageId;
        await messageService.markAsRead(messageId);
        res.json({ success: true, data: { messageId } });
    }
    catch (err) {
        logger.error({ err }, 'Mark as read failed');
        next(err);
    }
};
export const markConversationAsRead = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.userId;
        await messageService.markConversationAsRead(conversationId, userId);
        res.json({ success: true, data: { conversationId } });
    }
    catch (err) {
        logger.error({ err }, 'Mark conversation as read failed');
        next(err);
    }
};
