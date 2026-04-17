import { z } from 'zod';
import { conversationService } from '../services/index.js';
import { logger } from '../config/logger.js';
const createPrivateSchema = z.object({
    targetUserId: z.string().min(1),
});
const createGroupSchema = z.object({
    name: z.string().min(1).max(100),
    participantIds: z.array(z.string().min(1)).min(1),
});
export const createPrivate = async (req, res, next) => {
    try {
        const data = createPrivateSchema.parse(req.body);
        const userId = req.userId;
        const conversation = await conversationService.createPrivate(userId, data.targetUserId);
        res.status(201).json({ success: true, data: conversation });
    }
    catch (err) {
        logger.error({ err }, 'Create private conversation failed');
        next(err);
    }
};
export const createGroup = async (req, res, next) => {
    try {
        const data = createGroupSchema.parse(req.body);
        const userId = req.userId;
        const conversation = await conversationService.createGroup(userId, data.name, data.participantIds);
        res.status(201).json({ success: true, data: conversation });
    }
    catch (err) {
        logger.error({ err }, 'Create group conversation failed');
        next(err);
    }
};
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.userId;
        const conversations = await conversationService.getConversations(userId);
        res.json({ success: true, data: conversations });
    }
    catch (err) {
        logger.error({ err }, 'Get conversations failed');
        next(err);
    }
};
export const addParticipant = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const { userId: participantId } = req.body;
        const adminId = req.userId;
        await conversationService.addParticipant(conversationId, adminId, participantId);
        res.json({ success: true, data: { conversationId, participantId } });
    }
    catch (err) {
        logger.error({ err }, 'Add participant failed');
        next(err);
    }
};
export const removeParticipant = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const { userId: participantId } = req.body;
        const adminId = req.userId;
        await conversationService.removeParticipant(conversationId, adminId, participantId);
        res.json({ success: true, data: { conversationId, participantId } });
    }
    catch (err) {
        logger.error({ err }, 'Remove participant failed');
        next(err);
    }
};
