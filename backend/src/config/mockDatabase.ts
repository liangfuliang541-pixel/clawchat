import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import type { User as IUser, Message as IMessage, Conversation as IConversation } from '@clawchat/shared';

// ============================================
// 🧪 In-Memory Mock Database for Quick API Validation
// ============================================

type UserDoc = IUser & { password: string };
type MessageDoc = IMessage;
type ConversationDoc = IConversation;

class MockDB {
  users = new Map<string, UserDoc>();
  messages = new Map<string, MessageDoc>();
  conversations = new Map<string, ConversationDoc>();
  emailIndex = new Map<string, string>();
  usernameIndex = new Map<string, string>();

  async createUser(data: { username: string; email: string; password: string }): Promise<UserDoc> {
    if (this.emailIndex.has(data.email) || this.usernameIndex.has(data.username)) {
      throw new Error('User already exists');
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    const user: UserDoc = {
      _id: id,
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 12),
      avatar: '',
      bio: '',
      status: 'offline',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    this.emailIndex.set(user.email, id);
    this.usernameIndex.set(user.username, id);
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
    if (!user) return false;
    return bcrypt.compare(candidate, user.password);
  }

  async updateStatus(userId: string, status: IUser['status']) {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
    }
  }
}

export const mockDB = new MockDB();
