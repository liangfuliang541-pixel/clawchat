import { Conversation } from '../models/Conversation.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
const USE_MOCK = process.env.USE_MOCK_DB === 'true';
export class ConversationRepository extends BaseRepository {
    constructor() {
        super(Conversation);
    }
    async create(data) {
        if (USE_MOCK) {
            return mockDB.createConversation(data);
        }
        return super.create(data);
    }
    async findById(id) {
        if (USE_MOCK) {
            return mockDB.findConversationById(id);
        }
        return super.findById(id);
    }
    async findByParticipant(userId) {
        if (USE_MOCK) {
            return mockDB.findConversationsByParticipant(userId);
        }
        return Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .populate('participants', 'username avatar status')
            .populate('lastMessage')
            .lean()
            .exec();
    }
    async findPrivateBetween(userA, userB) {
        if (USE_MOCK) {
            return mockDB.findPrivateBetween(userA, userB);
        }
        return Conversation.findOne({
            type: 'private',
            participants: { $all: [userA, userB], $size: 2 },
        })
            .populate('participants', 'username avatar status')
            .lean()
            .exec();
    }
    async updateLastMessage(conversationId, messageId) {
        if (USE_MOCK) {
            await mockDB.updateLastMessage(conversationId, messageId);
            return;
        }
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: messageId,
            updatedAt: new Date(),
        }).exec();
    }
    async addParticipant(conversationId, userId) {
        if (USE_MOCK) {
            await mockDB.addParticipant(conversationId, userId);
            return;
        }
        await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { participants: userId },
        }).exec();
    }
    async removeParticipant(conversationId, userId) {
        if (USE_MOCK) {
            await mockDB.removeParticipant(conversationId, userId);
            return;
        }
        await Conversation.findByIdAndUpdate(conversationId, {
            $pull: { participants: userId },
        }).exec();
    }
}
export const conversationRepository = new ConversationRepository();
