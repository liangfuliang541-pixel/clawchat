import { conversationRepository, messageRepository } from '../repositories/index.js';
import { ConflictError, NotFoundError, AuthenticationError } from '../utils/AppError.js';
import type { Conversation } from '@clawchat/shared';
import type { IConversationDoc } from '../models/Conversation.js';

const toConversationResponse = (conv: IConversationDoc): Conversation => ({
  _id: conv._id.toString(),
  participants: (conv.participants as any[]).map((p) =>
    typeof p === 'string' ? p : p._id?.toString?.() || p.toString()
  ),
  type: conv.type as Conversation['type'],
  name: conv.name,
  avatar: conv.avatar,
  lastMessage: conv.lastMessage
    ? {
        _id: (conv.lastMessage as any)._id?.toString?.() || conv.lastMessage.toString(),
        sender: (conv.lastMessage as any).sender?.toString?.() || '',
        receiver: (conv.lastMessage as any).receiver?.toString?.() || '',
        conversationId: (conv.lastMessage as any).conversationId || '',
        content: (conv.lastMessage as any).content || '',
        type: (conv.lastMessage as any).type || 'text',
        isRead: (conv.lastMessage as any).isRead || false,
        createdAt: (conv.lastMessage as any).createdAt?.toISOString?.() || new Date().toISOString(),
      }
    : undefined,
  updatedAt: (conv.updatedAt as unknown as Date).toISOString(),
});

export class ConversationService {
  async createPrivate(userId: string, targetUserId: string): Promise<Conversation> {
    if (userId === targetUserId) {
      throw new ConflictError('Cannot create conversation with yourself');
    }

    const existing = await conversationRepository.findPrivateBetween(userId, targetUserId);
    if (existing) {
      return toConversationResponse(existing);
    }

    const conversation = await conversationRepository.create({
      participants: [userId as any, targetUserId as any],
      type: 'private',
    });

    return toConversationResponse(conversation as IConversationDoc);
  }

  async createGroup(userId: string, name: string, participantIds: string[]): Promise<Conversation> {
    const participants = Array.from(new Set([userId, ...participantIds]));
    const conversation = await conversationRepository.create({
      participants: participants as any,
      type: 'group',
      name,
    });
    return toConversationResponse(conversation as IConversationDoc);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = await conversationRepository.findByParticipant(userId);
    // Enrich with unread count
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const unread = await messageRepository.countUnread(conv._id.toString(), userId);
        return {
          ...toConversationResponse(conv as IConversationDoc),
          unreadCount: unread,
        };
      })
    );
    return enriched as Conversation[];
  }

  async addParticipant(conversationId: string, adminId: string, userId: string): Promise<void> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.type !== 'group') {
      throw new ConflictError('Only group conversations support adding participants');
    }
    await conversationRepository.addParticipant(conversationId, userId);
  }

  async removeParticipant(conversationId: string, adminId: string, userId: string): Promise<void> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.type !== 'group') {
      throw new ConflictError('Only group conversations support removing participants');
    }
    await conversationRepository.removeParticipant(conversationId, userId);
  }
}

export const conversationService = new ConversationService();
