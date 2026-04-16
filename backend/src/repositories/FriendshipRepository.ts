import { Friendship } from '../models/Friendship.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
import type { IFriendshipDoc } from '../models/Friendship.js';

const USE_MOCK = process.env.USE_MOCK_DB === 'true';

export class FriendshipRepository extends BaseRepository<IFriendshipDoc> {
  constructor() {
    super(Friendship);
  }

  async create(data: Partial<IFriendshipDoc>): Promise<IFriendshipDoc> {
    if (USE_MOCK) {
      return mockDB.createFriendship(data as any) as unknown as Promise<IFriendshipDoc>;
    }
    return super.create(data);
  }

  async findById(id: string): Promise<IFriendshipDoc | null> {
    if (USE_MOCK) {
      return (mockDB as any).friendships.get(id) || null;
    }
    return super.findById(id);
  }

  async findBetween(userA: string, userB: string): Promise<IFriendshipDoc | null> {
    if (USE_MOCK) {
      return (await mockDB.findFriendshipBetween(userA, userB)) as unknown as IFriendshipDoc | null;
    }
    return Friendship.findOne({
      $or: [
        { requester: userA, recipient: userB },
        { requester: userB, recipient: userA },
      ],
    })
      .lean<IFriendshipDoc>()
      .exec();
  }

  async findByUser(userId: string): Promise<IFriendshipDoc[]> {
    if (USE_MOCK) {
      const list = await mockDB.findFriendshipsByUser(userId);
      return list.map((f) => {
        const requesterUser = mockDB.findById(f.requester);
        const recipientUser = mockDB.findById(f.recipient);
        return {
          ...f,
          requester: requesterUser as any,
          recipient: recipientUser as any,
        } as unknown as unknown as IFriendshipDoc;
      });
    }
    return Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted',
    })
      .populate('requester recipient', 'username avatar status')
      .lean<IFriendshipDoc[]>()
      .exec();
  }

  async findPendingByRecipient(userId: string): Promise<IFriendshipDoc[]> {
    if (USE_MOCK) {
      const list = await mockDB.findPendingByRecipient(userId);
      return list.map((f) => {
        const requesterUser = mockDB.findById(f.requester);
        return {
          ...f,
          requester: requesterUser as any,
        } as unknown as unknown as IFriendshipDoc;
      });
    }
    return Friendship.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'username avatar status')
      .lean<IFriendshipDoc[]>()
      .exec();
  }

  async updateStatus(
    requesterId: string,
    recipientId: string,
    status: IFriendshipDoc['status']
  ): Promise<void> {
    if (USE_MOCK) {
      await mockDB.updateFriendshipStatus(requesterId, recipientId, status);
      return;
    }
    await Friendship.updateOne(
      { requester: requesterId, recipient: recipientId },
      { status }
    ).exec();
  }

  async deleteBetween(userA: string, userB: string): Promise<void> {
    if (USE_MOCK) {
      await mockDB.deleteFriendshipBetween(userA, userB);
      return;
    }
    await Friendship.deleteOne({
      $or: [
        { requester: userA, recipient: userB },
        { requester: userB, recipient: userA },
      ],
    }).exec();
  }
}

export const friendshipRepository = new FriendshipRepository();
