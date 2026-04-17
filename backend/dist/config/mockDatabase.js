import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
class MockDB {
    users = new Map();
    messages = new Map();
    conversations = new Map();
    friendships = new Map();
    emailIndex = new Map();
    usernameIndex = new Map();
    // Users
    async createUser(data) {
        if (this.usernameIndex.has(data.username)) {
            throw new Error('User already exists');
        }
        const id = randomUUID();
        const now = new Date().toISOString();
        const user = {
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
    async findByEmail(email) {
        const id = this.emailIndex.get(email);
        return id ? (this.users.get(id) ?? null) : null;
    }
    async findById(id) {
        return this.users.get(id) ?? null;
    }
    async comparePassword(userId, candidate) {
        const user = this.users.get(userId);
        if (!user || !user.password)
            return false;
        return bcrypt.compare(candidate, user.password);
    }
    async updateStatus(userId, status) {
        const user = this.users.get(userId);
        if (user) {
            user.status = status;
            user.updatedAt = new Date().toISOString();
        }
    }
    // Messages
    async createMessage(data) {
        const id = randomUUID();
        const now = new Date().toISOString();
        const msg = {
            _id: id,
            ...data,
            createdAt: now,
        };
        this.messages.set(id, msg);
        return msg;
    }
    async findMessagesByConversation(conversationId, limit = 50, beforeCursor, populateSender = false) {
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
                const senderUser = this.users.get(msg.sender);
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
    async markMessageAsRead(messageId) {
        const msg = this.messages.get(messageId);
        if (msg)
            msg.isRead = true;
    }
    async markConversationAsRead(conversationId, userId) {
        for (const msg of this.messages.values()) {
            if (msg.conversationId === conversationId &&
                msg.receiver === userId &&
                !msg.isRead) {
                msg.isRead = true;
            }
        }
    }
    async countUnread(conversationId, userId) {
        return Array.from(this.messages.values()).filter((m) => m.conversationId === conversationId && m.receiver === userId && !m.isRead).length;
    }
    // Conversations
    async createConversation(data) {
        const id = randomUUID();
        const now = new Date().toISOString();
        const conv = {
            _id: id,
            ...data,
            createdAt: now,
            updatedAt: now,
        };
        this.conversations.set(id, conv);
        return conv;
    }
    async findConversationById(id) {
        return this.conversations.get(id) ?? null;
    }
    async findConversationsByParticipant(userId) {
        return Array.from(this.conversations.values())
            .filter((c) => c.participants.includes(userId))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    async findPrivateBetween(userA, userB) {
        return (Array.from(this.conversations.values()).find((c) => c.type === 'private' &&
            c.participants.length === 2 &&
            c.participants.includes(userA) &&
            c.participants.includes(userB)) || null);
    }
    async updateLastMessage(conversationId, messageId) {
        const conv = this.conversations.get(conversationId);
        if (conv) {
            conv.lastMessage = messageId;
            conv.updatedAt = new Date().toISOString();
        }
    }
    async addParticipant(conversationId, userId) {
        const conv = this.conversations.get(conversationId);
        if (conv && !conv.participants.includes(userId)) {
            conv.participants.push(userId);
            conv.updatedAt = new Date().toISOString();
        }
    }
    async removeParticipant(conversationId, userId) {
        const conv = this.conversations.get(conversationId);
        if (conv) {
            conv.participants = conv.participants.filter((id) => id !== userId);
            conv.updatedAt = new Date().toISOString();
        }
    }
    // Friendships
    async createFriendship(data) {
        const id = randomUUID();
        const now = new Date().toISOString();
        const f = { _id: id, ...data, createdAt: now, updatedAt: now };
        this.friendships.set(id, f);
        return f;
    }
    async findFriendshipBetween(userA, userB) {
        return (Array.from(this.friendships.values()).find((f) => (f.requester === userA && f.recipient === userB) ||
            (f.requester === userB && f.recipient === userA)) || null);
    }
    async findFriendshipsByUser(userId) {
        return Array.from(this.friendships.values()).filter((f) => f.status === 'accepted' && (f.requester === userId || f.recipient === userId));
    }
    async findPendingByRecipient(userId) {
        return Array.from(this.friendships.values()).filter((f) => f.status === 'pending' && f.recipient === userId);
    }
    async updateFriendshipStatus(requesterId, recipientId, status) {
        const f = Array.from(this.friendships.values()).find((x) => x.requester === requesterId && x.recipient === recipientId);
        if (f) {
            f.status = status;
            f.updatedAt = new Date().toISOString();
        }
    }
    async deleteFriendshipBetween(userA, userB) {
        const id = Array.from(this.friendships.values()).find((f) => (f.requester === userA && f.recipient === userB) ||
            (f.requester === userB && f.recipient === userA))?._id;
        if (id)
            this.friendships.delete(id);
    }
}
export const mockDB = new MockDB();
