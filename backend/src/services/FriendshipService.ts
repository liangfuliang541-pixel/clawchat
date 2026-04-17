import { friendshipRepository, userRepository } from '../repositories/index.js';
import { ConflictError, NotFoundError } from '../utils/AppError.js';
import type { User } from '@clawchat/shared';

const toUserResponse = (user: any): User => ({
  _id: user._id.toString?.() || user._id,
  username: user.username,
  email: user.email || '',
  avatar: user.avatar || '',
  bio: user.bio || '',
  status: user.status,
  kind: user.kind || 'human',
  agentType: user.agentType,
  createdAt: user.createdAt?.toISOString?.() || user.createdAt,
  updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
});

export class FriendshipService {
  async sendRequest(userId: string, targetUserId: string): Promise<{ status: string }> {
    if (userId === targetUserId) {
      throw new ConflictError('Cannot send friend request to yourself');
    }

    const target = await userRepository.findById(targetUserId);
    if (!target) throw new NotFoundError('User');

    const existing = await friendshipRepository.findBetween(userId, targetUserId);
    if (existing) {
      if (existing.status === 'blocked') throw new ConflictError('Friendship is blocked');
      if (existing.status === 'accepted') throw new ConflictError('Already friends');
      return { status: 'pending' };
    }

    await friendshipRepository.create({
      requester: userId as any,
      recipient: targetUserId as any,
      status: 'pending',
    });

    return { status: 'pending' };
  }

  async acceptRequest(userId: string, requesterId: string): Promise<{ status: string }> {
    const friendship = await friendshipRepository.findBetween(userId, requesterId);
    if (!friendship || friendship.status !== 'pending') {
      throw new NotFoundError('Friend request');
    }
    if (friendship.recipient.toString() !== userId) {
      throw new ConflictError('Only recipient can accept request');
    }

    await friendshipRepository.updateStatus(requesterId, userId, 'accepted');
    return { status: 'accepted' };
  }

  async rejectRequest(userId: string, requesterId: string): Promise<void> {
    const friendship = await friendshipRepository.findBetween(userId, requesterId);
    if (!friendship || friendship.status !== 'pending') {
      throw new NotFoundError('Friend request');
    }
    await friendshipRepository.deleteBetween(requesterId, userId);
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await friendshipRepository.findByUser(userId);
    return friendships.map((f) => {
      const other = f.requester.toString() === userId ? (f.recipient as any) : (f.requester as any);
      return toUserResponse(other);
    });
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    const requests = await friendshipRepository.findPendingByRecipient(userId);
    return requests.map((r) => ({
      _id: r._id.toString(),
      requester: toUserResponse(r.requester),
      createdAt: (r.createdAt as Date).toISOString(),
    }));
  }
}

export const friendshipService = new FriendshipService();
