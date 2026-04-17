import { conversationRepository, messageRepository } from '../repositories/index.js';
import { ConflictError, NotFoundError } from '../utils/AppError.js';
const toConversationResponse = (conv) => ({
    _id: conv._id.toString(),
    participants: conv.participants.map((p) => typeof p === 'string' ? p : p._id?.toString?.() || p.toString()),
    type: conv.type,
    name: conv.name,
    avatar: conv.avatar,
    lastMessage: conv.lastMessage
        ? {
            _id: conv.lastMessage._id?.toString?.() || conv.lastMessage.toString(),
            sender: conv.lastMessage.sender?.toString?.() || '',
            receiver: conv.lastMessage.receiver?.toString?.() || '',
            conversationId: conv.lastMessage.conversationId || '',
            content: conv.lastMessage.content || '',
            type: conv.lastMessage.type || 'text',
            isRead: conv.lastMessage.isRead || false,
            createdAt: conv.lastMessage.createdAt?.toISOString?.() || new Date().toISOString(),
        }
        : undefined,
    updatedAt: conv.updatedAt.toISOString(),
});
export class ConversationService {
    async createPrivate(userId, targetUserId) {
        if (userId === targetUserId) {
            throw new ConflictError('Cannot create conversation with yourself');
        }
        const existing = await conversationRepository.findPrivateBetween(userId, targetUserId);
        if (existing) {
            return toConversationResponse(existing);
        }
        const conversation = await conversationRepository.create({
            participants: [userId, targetUserId],
            type: 'private',
        });
        return toConversationResponse(conversation);
    }
    async createGroup(userId, name, participantIds) {
        const participants = Array.from(new Set([userId, ...participantIds]));
        const conversation = await conversationRepository.create({
            participants: participants,
            type: 'group',
            name,
        });
        return toConversationResponse(conversation);
    }
    async getConversations(userId) {
        const conversations = await conversationRepository.findByParticipant(userId);
        // Enrich with unread count
        const enriched = await Promise.all(conversations.map(async (conv) => {
            const unread = await messageRepository.countUnread(conv._id.toString(), userId);
            return {
                ...toConversationResponse(conv),
                unreadCount: unread,
            };
        }));
        return enriched;
    }
    async addParticipant(conversationId, adminId, userId) {
        const conversation = await conversationRepository.findById(conversationId);
        if (!conversation)
            throw new NotFoundError('Conversation');
        if (conversation.type !== 'group') {
            throw new ConflictError('Only group conversations support adding participants');
        }
        await conversationRepository.addParticipant(conversationId, userId);
    }
    async removeParticipant(conversationId, adminId, userId) {
        const conversation = await conversationRepository.findById(conversationId);
        if (!conversation)
            throw new NotFoundError('Conversation');
        if (conversation.type !== 'group') {
            throw new ConflictError('Only group conversations support removing participants');
        }
        await conversationRepository.removeParticipant(conversationId, userId);
    }
}
export const conversationService = new ConversationService();
