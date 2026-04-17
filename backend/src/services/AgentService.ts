import { randomUUID } from 'crypto';
import {
  userRepository,
  conversationRepository,
  messageRepository,
} from '../repositories/index.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/AppError.js';
import type { Message, User } from '@clawchat/shared';

const toUserResponse = (user: any): User => ({
  _id: user._id.toString?.() || user._id,
  username: user.username,
  email: user.email || '',
  avatar: user.avatar || '',
  bio: user.bio || '',
  status: user.status,
  kind: user.kind,
  agentType: user.agentType,
  createdAt: user.createdAt?.toISOString?.() || user.createdAt,
  updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
});

export class AgentService {
  async registerAgent(data: {
    username: string;
    agentType: string;
    avatar?: string;
    bio?: string;
  }): Promise<{ agent: User; apiKey: string }> {
    const existing = await userRepository.findByUsername(data.username);
    if (existing) throw new ConflictError('Username already taken');

    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`;
    const agent = await userRepository.create({
      username: data.username,
      kind: 'agent',
      agentType: data.agentType,
      avatar: data.avatar || '',
      bio: data.bio || '',
      apiKey,
      status: 'online',
    });

    return { agent: toUserResponse(agent), apiKey };
  }

  async sendMessage(
    agentId: string,
    data: {
      conversationId: string;
      content: string;
      type?: Message['type'];
    }
  ): Promise<Message> {
    const conversation = await conversationRepository.findById(data.conversationId);
    if (!conversation) throw new NotFoundError('Conversation');

    const participants = (conversation.participants as unknown as string[]) || [];
    if (!participants.includes(agentId)) {
      throw new ValidationError({
        participants: 'Agent is not a participant of this conversation',
      });
    }

    const receiverId = participants.find((p) => p !== agentId) || agentId;

    const message = await messageRepository.create({
      sender: agentId as any,
      receiver: receiverId as any,
      conversationId: data.conversationId,
      content: data.content,
      type: data.type || 'text',
      isRead: false,
    });

    await conversationRepository.updateLastMessage(data.conversationId, message._id.toString());

    return {
      _id: message._id.toString(),
      sender: agentId,
      receiver: receiverId,
      conversationId: data.conversationId,
      content: data.content,
      type: (data.type || 'text') as Message['type'],
      isRead: false,
      createdAt: (message.createdAt as unknown as Date).toISOString?.()
        ? (message.createdAt as unknown as Date).toISOString()
        : new Date().toISOString(),
    };
  }

  async getAgents(): Promise<User[]> {
    const agents = await userRepository.findAgents();
    return agents.map(toUserResponse);
  }
}

export const agentService = new AgentService();
