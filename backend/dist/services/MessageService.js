import { messageRepository, conversationRepository } from '../repositories/index.js';
import { NotFoundError } from '../utils/AppError.js';
const toMessageResponse = (msg) => {
    const sender = typeof msg.sender === 'object' && msg.sender !== null
        ? {
            _id: msg.sender._id?.toString?.() || msg.sender._id,
            username: msg.sender.username,
            email: msg.sender.email || '',
            avatar: msg.sender.avatar || '',
            bio: msg.sender.bio || '',
            status: msg.sender.status,
            kind: msg.sender.kind || 'human',
            agentType: msg.sender.agentType,
            createdAt: msg.sender.createdAt?.toISOString?.() || msg.sender.createdAt,
            updatedAt: msg.sender.updatedAt?.toISOString?.() || msg.sender.updatedAt,
        }
        : msg.sender?.toString?.() || msg.sender;
    return {
        _id: msg._id.toString(),
        sender,
        receiver: msg.receiver?.toString?.() || msg.receiver,
        conversationId: msg.conversationId,
        content: msg.content,
        type: msg.type,
        fileUrl: msg.fileUrl,
        isRead: msg.isRead,
        createdAt: msg.createdAt.toISOString(),
    };
};
export class MessageService {
    async sendMessage(data) {
        const conversation = await conversationRepository.findById(data.conversationId);
        if (!conversation) {
            throw new NotFoundError('Conversation');
        }
        // For simplicity in private chats, receiver is the other participant
        let receiverId = conversation.participants
            .find((p) => p.toString() !== data.senderId)
            ?.toString();
        // For group chats, receiver can be the conversation itself (broadcast)
        if (!receiverId) {
            receiverId = data.senderId;
        }
        const message = await messageRepository.create({
            sender: data.senderId,
            receiver: receiverId,
            conversationId: data.conversationId,
            content: data.content,
            type: data.type || 'text',
            fileUrl: data.fileUrl,
            isRead: false,
        });
        await conversationRepository.updateLastMessage(data.conversationId, message._id.toString());
        return toMessageResponse(message);
    }
    async getHistory(conversationId, limit = 50, beforeCursor) {
        const result = await messageRepository.findByConversation(conversationId, limit, beforeCursor);
        return {
            items: result.items.map(toMessageResponse),
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
        };
    }
    async markAsRead(messageId) {
        await messageRepository.markAsRead(messageId);
    }
    async markConversationAsRead(conversationId, userId) {
        await messageRepository.markConversationAsRead(conversationId, userId);
    }
    async getUnreadCount(conversationId, userId) {
        return messageRepository.countUnread(conversationId, userId);
    }
}
export const messageService = new MessageService();
