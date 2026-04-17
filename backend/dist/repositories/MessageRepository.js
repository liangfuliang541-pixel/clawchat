import { Message } from '../models/Message.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
const USE_MOCK = process.env.USE_MOCK_DB === 'true';
export class MessageRepository extends BaseRepository {
    constructor() {
        super(Message);
    }
    async create(data) {
        if (USE_MOCK) {
            return mockDB.createMessage(data);
        }
        return super.create(data);
    }
    async findById(id) {
        if (USE_MOCK) {
            return mockDB.messages.get(id) || null;
        }
        return super.findById(id);
    }
    async findByConversation(conversationId, limit = 50, beforeCursor) {
        if (USE_MOCK) {
            const result = await mockDB.findMessagesByConversation(conversationId, limit, beforeCursor, true);
            return result;
        }
        const filter = { conversationId };
        if (beforeCursor) {
            filter.createdAt = { $lt: new Date(beforeCursor) };
        }
        const items = await Message.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .populate('sender', 'username avatar kind agentType')
            .lean()
            .exec();
        const hasMore = items.length > limit;
        if (hasMore)
            items.pop();
        return {
            items,
            nextCursor: hasMore && items.length > 0
                ? items[items.length - 1].createdAt.toISOString()
                : undefined,
            hasMore,
        };
    }
    async markAsRead(messageId) {
        if (USE_MOCK) {
            await mockDB.markMessageAsRead(messageId);
            return;
        }
        await Message.findByIdAndUpdate(messageId, { isRead: true }).exec();
    }
    async markConversationAsRead(conversationId, userId) {
        if (USE_MOCK) {
            await mockDB.markConversationAsRead(conversationId, userId);
            return;
        }
        await Message.updateMany({ conversationId, receiver: userId, isRead: false }, { isRead: true }).exec();
    }
    async countUnread(conversationId, userId) {
        if (USE_MOCK) {
            return mockDB.countUnread(conversationId, userId);
        }
        return Message.countDocuments({ conversationId, receiver: userId, isRead: false }).exec();
    }
    async findRecentByConversation(conversationId, limit = 50) {
        if (USE_MOCK) {
            const result = await mockDB.findMessagesByConversation(conversationId, limit, undefined, true);
            return result.items;
        }
        return Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sender', 'username avatar kind agentType')
            .lean()
            .exec();
    }
}
export const messageRepository = new MessageRepository();
