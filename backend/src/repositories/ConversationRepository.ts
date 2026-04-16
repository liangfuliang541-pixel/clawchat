import { Conversation } from '../models/Conversation.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
import type { IConversationDoc } from '../models/Conversation.js';

const USE_MOCK = process.env.USE_MOCK_DB === 'true';

export class ConversationRepository extends BaseRepository<IConversationDoc> {
  constructor() {
    super(Conversation);
  }

  async create(data: Partial<IConversationDoc>): Promise<IConversationDoc> {
    if (USE_MOCK) {
      return mockDB.createConversation(data as any) as unknown as Promise<IConversationDoc>;
    }
    return super.create(data);
  }

  async findById(id: string): Promise<IConversationDoc | null> {
    if (USE_MOCK) {
      return mockDB.findConversationById(id) as unknown as Promise<IConversationDoc | null>;
    }
    return super.findById(id);
  }

  async findByParticipant(userId: string): Promise<IConversationDoc[]> {
    if (USE_MOCK) {
      return mockDB.findConversationsByParticipant(userId) as unknown as Promise<
        IConversationDoc[]
      >;
    }
    return Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username avatar status')
      .populate('lastMessage')
      .lean<IConversationDoc[]>()
      .exec();
  }

  async findPrivateBetween(userA: string, userB: string): Promise<IConversationDoc | null> {
    if (USE_MOCK) {
      return mockDB.findPrivateBetween(userA, userB) as Promise<IConversationDoc | null>;
    }
    return Conversation.findOne({
      type: 'private',
      participants: { $all: [userA, userB], $size: 2 },
    })
      .populate('participants', 'username avatar status')
      .lean<IConversationDoc>()
      .exec();
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    if (USE_MOCK) {
      await mockDB.updateLastMessage(conversationId, messageId);
      return;
    }
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
      updatedAt: new Date(),
    }).exec();
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    if (USE_MOCK) {
      await mockDB.addParticipant(conversationId, userId);
      return;
    }
    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { participants: userId },
    }).exec();
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
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
