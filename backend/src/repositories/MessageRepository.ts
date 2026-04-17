import { Message } from '../models/Message.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
import type { IMessageDoc } from '../models/Message.js';

const USE_MOCK = process.env.USE_MOCK_DB === 'true';

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export class MessageRepository extends BaseRepository<IMessageDoc> {
  constructor() {
    super(Message);
  }

  async create(data: Partial<IMessageDoc>): Promise<IMessageDoc> {
    if (USE_MOCK) {
      return mockDB.createMessage(data as any) as unknown as Promise<IMessageDoc>;
    }
    return super.create(data);
  }

  async findById(id: string): Promise<IMessageDoc | null> {
    if (USE_MOCK) {
      return (mockDB as any).messages.get(id) || null;
    }
    return super.findById(id);
  }

  async findByConversation(
    conversationId: string,
    limit = 50,
    beforeCursor?: string
  ): Promise<CursorPaginationResult<IMessageDoc>> {
    if (USE_MOCK) {
      const result = await mockDB.findMessagesByConversation(
        conversationId,
        limit,
        beforeCursor,
        true
      );
      return result as unknown as CursorPaginationResult<IMessageDoc>;
    }

    const filter: Record<string, unknown> = { conversationId };
    if (beforeCursor) {
      filter.createdAt = { $lt: new Date(beforeCursor) };
    }

    const items = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('sender', 'username avatar kind agentType')
      .lean<IMessageDoc[]>()
      .exec();

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return {
      items,
      nextCursor:
        hasMore && items.length > 0
          ? (items[items.length - 1].createdAt as unknown as Date).toISOString()
          : undefined,
      hasMore,
    };
  }

  async markAsRead(messageId: string): Promise<void> {
    if (USE_MOCK) {
      await mockDB.markMessageAsRead(messageId);
      return;
    }
    await Message.findByIdAndUpdate(messageId, { isRead: true }).exec();
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    if (USE_MOCK) {
      await mockDB.markConversationAsRead(conversationId, userId);
      return;
    }
    await Message.updateMany(
      { conversationId, receiver: userId, isRead: false },
      { isRead: true }
    ).exec();
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    if (USE_MOCK) {
      return mockDB.countUnread(conversationId, userId);
    }
    return Message.countDocuments({ conversationId, receiver: userId, isRead: false }).exec();
  }

  async findRecentByConversation(conversationId: string, limit = 50): Promise<IMessageDoc[]> {
    if (USE_MOCK) {
      const result = await mockDB.findMessagesByConversation(
        conversationId,
        limit,
        undefined,
        true
      );
      return result.items as unknown as IMessageDoc[];
    }
    return Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username avatar kind agentType')
      .lean<IMessageDoc[]>()
      .exec();
  }

  async recall(messageId: string, senderId: string): Promise<IMessageDoc | null> {
    if (USE_MOCK) {
      return mockDB.recallMessage(messageId, senderId) as unknown as IMessageDoc | null;
    }
    const msg = await Message.findById(messageId).lean().exec();
    if (!msg) return null;
    const msgSender = (msg.sender as any)?.toString?.() || msg.sender;
    if (msgSender !== senderId) return null;
    return Message.findByIdAndUpdate(messageId, { isRecalled: true, content: '' }, { new: true })
      .lean()
      .exec() as Promise<IMessageDoc | null>;
  }
}

export const messageRepository = new MessageRepository();
