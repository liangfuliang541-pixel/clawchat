import { messageRepository, conversationRepository } from '../repositories/index.js';
import { NotFoundError } from '../utils/AppError.js';
import type { Message } from '@clawchat/shared';
import type { IMessageDoc } from '../models/Message.js';

const toMessageResponse = (msg: IMessageDoc): Message => {
  const sender =
    typeof msg.sender === 'object' && msg.sender !== null
      ? {
          _id: (msg.sender as any)._id?.toString?.() || (msg.sender as any)._id,
          username: (msg.sender as any).username,
          email: (msg.sender as any).email || '',
          avatar: (msg.sender as any).avatar || '',
          bio: (msg.sender as any).bio || '',
          status: (msg.sender as any).status,
          kind: (msg.sender as any).kind || 'human',
          agentType: (msg.sender as any).agentType,
          createdAt:
            (msg.sender as any).createdAt?.toISOString?.() || (msg.sender as any).createdAt,
          updatedAt:
            (msg.sender as any).updatedAt?.toISOString?.() || (msg.sender as any).updatedAt,
        }
      : (msg.sender as any)?.toString?.() || msg.sender;

  return {
    _id: msg._id.toString(),
    sender,
    receiver: (msg.receiver as any)?.toString?.() || msg.receiver,
    conversationId: msg.conversationId,
    content: msg.content,
    type: msg.type as Message['type'],
    fileUrl: msg.fileUrl,
    isRead: msg.isRead,
    createdAt: (msg.createdAt as unknown as Date).toISOString(),
  };
};

export class MessageService {
  async sendMessage(data: {
    senderId: string;
    conversationId: string;
    content: string;
    type?: Message['type'];
    fileUrl?: string;
  }): Promise<Message> {
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
      sender: data.senderId as any,
      receiver: receiverId as any,
      conversationId: data.conversationId,
      content: data.content,
      type: data.type || 'text',
      fileUrl: data.fileUrl,
      isRead: false,
    });

    await conversationRepository.updateLastMessage(data.conversationId, message._id.toString());

    return toMessageResponse(message as IMessageDoc);
  }

  async getHistory(conversationId: string, limit = 50, beforeCursor?: string) {
    const result = await messageRepository.findByConversation(conversationId, limit, beforeCursor);
    return {
      items: result.items.map(toMessageResponse),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async markAsRead(messageId: string): Promise<void> {
    await messageRepository.markAsRead(messageId);
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await messageRepository.markConversationAsRead(conversationId, userId);
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return messageRepository.countUnread(conversationId, userId);
  }
}

export const messageService = new MessageService();
