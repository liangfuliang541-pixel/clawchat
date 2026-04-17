import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import type {
  User as IUser,
  Message as IMessage,
  Conversation as IConversation,
} from '@clawchat/shared';

// ============================================
// 🧪 In-Memory Mock Database for Quick API Validation
// ============================================

type UserDoc = IUser & { password?: string; apiKey?: string };
type MessageDoc = IMessage;
type ConversationDoc = IConversation;

type FriendshipDoc = {
  _id: string;
  requester: string;
  recipient: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
};

type HermesConfigDoc = {
  _id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model?: string;
  enabled: boolean;
  autoReply?: boolean;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
};

class MockDB {
  users = new Map<string, UserDoc>();
  messages = new Map<string, MessageDoc>();
  conversations = new Map<string, ConversationDoc>();
  friendships = new Map<string, FriendshipDoc>();
  hermesConfigs = new Map<string, HermesConfigDoc>();
  emailIndex = new Map<string, string>();
  usernameIndex = new Map<string, string>();

  // Users
  async createUser(data: {
    username: string;
    email?: string;
    password?: string;
    apiKey?: string;
    kind?: 'human' | 'agent';
    agentType?: string;
    avatar?: string;
    bio?: string;
  }): Promise<UserDoc> {
    if (this.usernameIndex.has(data.username)) {
      throw new Error('User already exists');
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    const user: UserDoc = {
      _id: id,
      username: data.username,
      email: data.email || '',
      password: data.password ? await bcrypt.hash(data.password, 12) : undefined,
      apiKey: data.apiKey,
      avatar: data.avatar || '',
      bio: data.bio || '',
      status: 'offline',
      kind: data.kind || 'human',
      agentType: data.agentType,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    this.usernameIndex.set(user.username, id);
    if (user.email) {
      this.emailIndex.set(user.email, id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDoc | null> {
    const id = this.emailIndex.get(email);
    return id ? (this.users.get(id) ?? null) : null;
  }

  async findById(id: string): Promise<UserDoc | null> {
    return this.users.get(id) ?? null;
  }

  async comparePassword(userId: string, candidate: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.password) return false;
    return bcrypt.compare(candidate, user.password);
  }

  async updateStatus(userId: string, status: IUser['status']) {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
    }
  }

  // Messages
  async createMessage(data: Omit<MessageDoc, '_id' | 'createdAt'>): Promise<MessageDoc> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const msg: MessageDoc = {
      _id: id,
      ...data,
      createdAt: now,
    } as MessageDoc;
    this.messages.set(id, msg);
    return msg;
  }

  async findMessagesByConversation(
    conversationId: string,
    limit = 50,
    beforeCursor?: string,
    populateSender = false
  ): Promise<{ items: MessageDoc[]; nextCursor?: string; hasMore: boolean }> {
    let list = Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (beforeCursor) {
      const beforeTime = new Date(beforeCursor).getTime();
      list = list.filter((m) => new Date(m.createdAt).getTime() < beforeTime);
    }

    const hasMore = list.length > limit;
    let items = hasMore ? list.slice(0, limit) : list;

    if (populateSender) {
      items = items.map((msg) => {
        const senderUser = this.users.get(msg.sender as string);
        if (senderUser) {
          return {
            ...msg,
            sender: senderUser,
          };
        }
        return msg;
      });
    }

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt : undefined;
    return { items, nextCursor, hasMore };
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const msg = this.messages.get(messageId);
    if (msg) msg.isRead = true;
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    for (const msg of this.messages.values()) {
      if (
        msg.conversationId === conversationId &&
        (msg.receiver as string) === userId &&
        !msg.isRead
      ) {
        msg.isRead = true;
      }
    }
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId && (m.receiver as string) === userId && !m.isRead
    ).length;
  }

  async recallMessage(messageId: string, senderId: string): Promise<MessageDoc | null> {
    const msg = this.messages.get(messageId);
    if (!msg) return null;
    const msgSender = typeof msg.sender === 'object' ? (msg.sender as any)._id : msg.sender;
    if (msgSender !== senderId) return null;
    msg.isRecalled = true;
    msg.content = '';
    return msg;
  }

  // Conversations
  async createConversation(
    data: Omit<ConversationDoc, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConversationDoc> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const conv: ConversationDoc = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now,
    } as ConversationDoc;
    this.conversations.set(id, conv);
    return conv;
  }

  async findConversationById(id: string): Promise<ConversationDoc | null> {
    return this.conversations.get(id) ?? null;
  }

  async findConversationsByParticipant(userId: string): Promise<ConversationDoc[]> {
    return Array.from(this.conversations.values())
      .filter((c) => (c.participants as string[]).includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async findPrivateBetween(userA: string, userB: string): Promise<ConversationDoc | null> {
    return (
      Array.from(this.conversations.values()).find(
        (c) =>
          c.type === 'private' &&
          (c.participants as string[]).length === 2 &&
          (c.participants as string[]).includes(userA) &&
          (c.participants as string[]).includes(userB)
      ) || null
    );
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.lastMessage = messageId as any;
      conv.updatedAt = new Date().toISOString();
    }
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const conv = this.conversations.get(conversationId);
    if (conv && !(conv.participants as string[]).includes(userId)) {
      (conv.participants as string[]).push(userId);
      conv.updatedAt = new Date().toISOString();
    }
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.participants = (conv.participants as string[]).filter((id) => id !== userId);
      conv.updatedAt = new Date().toISOString();
    }
  }

  // Friendships
  async createFriendship(
    data: Omit<FriendshipDoc, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<FriendshipDoc> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const f: FriendshipDoc = { _id: id, ...data, createdAt: now, updatedAt: now };
    this.friendships.set(id, f);
    return f;
  }

  async findFriendshipBetween(userA: string, userB: string): Promise<FriendshipDoc | null> {
    return (
      Array.from(this.friendships.values()).find(
        (f) =>
          (f.requester === userA && f.recipient === userB) ||
          (f.requester === userB && f.recipient === userA)
      ) || null
    );
  }

  async findFriendshipsByUser(userId: string): Promise<FriendshipDoc[]> {
    return Array.from(this.friendships.values()).filter(
      (f) => f.status === 'accepted' && (f.requester === userId || f.recipient === userId)
    );
  }

  async findPendingByRecipient(userId: string): Promise<FriendshipDoc[]> {
    return Array.from(this.friendships.values()).filter(
      (f) => f.status === 'pending' && f.recipient === userId
    );
  }

  async updateFriendshipStatus(
    requesterId: string,
    recipientId: string,
    status: FriendshipDoc['status']
  ): Promise<void> {
    const f = Array.from(this.friendships.values()).find(
      (x) => x.requester === requesterId && x.recipient === recipientId
    );
    if (f) {
      f.status = status;
      f.updatedAt = new Date().toISOString();
    }
  }

  async deleteFriendshipBetween(userA: string, userB: string): Promise<void> {
    const id = Array.from(this.friendships.values()).find(
      (f) =>
        (f.requester === userA && f.recipient === userB) ||
        (f.requester === userB && f.recipient === userA)
    )?._id;
    if (id) this.friendships.delete(id);
  }

  // Hermes Configs
  async createHermesConfig(
    data: Omit<HermesConfigDoc, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<HermesConfigDoc> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const cfg: HermesConfigDoc = { _id: id, ...data, createdAt: now, updatedAt: now };
    this.hermesConfigs.set(id, cfg);
    return cfg;
  }

  async findHermesConfigByName(name: string): Promise<HermesConfigDoc | null> {
    return Array.from(this.hermesConfigs.values()).find((c) => c.name === name) ?? null;
  }

  async findHermesConfigs(filter?: { enabled?: boolean }): Promise<HermesConfigDoc[]> {
    let all = Array.from(this.hermesConfigs.values());
    if (filter?.enabled !== undefined) {
      all = all.filter((c) => c.enabled === filter.enabled);
    }
    return all;
  }

  async upsertHermesConfig(data: {
    name: string;
    baseUrl: string;
    apiKey: string;
    model?: string;
    enabled?: boolean;
    autoReply?: boolean;
    systemPrompt?: string;
  }): Promise<HermesConfigDoc> {
    const existing = Array.from(this.hermesConfigs.values()).find((c) => c.name === data.name);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, data, { updatedAt: now });
      return existing;
    }
    const id = randomUUID();
    const cfg: HermesConfigDoc = {
      _id: id,
      ...data,
      enabled: data.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.hermesConfigs.set(id, cfg);
    return cfg;
  }

  async deleteHermesConfig(name: string): Promise<void> {
    const id = Array.from(this.hermesConfigs.entries()).find(([, c]) => c.name === name)?.[0];
    if (id) this.hermesConfigs.delete(id);
  }
}

export const mockDB = new MockDB();
