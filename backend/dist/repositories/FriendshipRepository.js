import { Friendship } from '../models/Friendship.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
const USE_MOCK = process.env.USE_MOCK_DB === 'true';
export class FriendshipRepository extends BaseRepository {
    constructor() {
        super(Friendship);
    }
    async create(data) {
        if (USE_MOCK) {
            return mockDB.createFriendship(data);
        }
        return super.create(data);
    }
    async findById(id) {
        if (USE_MOCK) {
            return mockDB.friendships.get(id) || null;
        }
        return super.findById(id);
    }
    async findBetween(userA, userB) {
        if (USE_MOCK) {
            return (await mockDB.findFriendshipBetween(userA, userB));
        }
        return Friendship.findOne({
            $or: [
                { requester: userA, recipient: userB },
                { requester: userB, recipient: userA },
            ],
        })
            .lean()
            .exec();
    }
    async findByUser(userId) {
        if (USE_MOCK) {
            const list = await mockDB.findFriendshipsByUser(userId);
            return list.map((f) => {
                const requesterUser = mockDB.findById(f.requester);
                const recipientUser = mockDB.findById(f.recipient);
                return {
                    ...f,
                    requester: requesterUser,
                    recipient: recipientUser,
                };
            });
        }
        return Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted',
        })
            .populate('requester recipient', 'username avatar status')
            .lean()
            .exec();
    }
    async findPendingByRecipient(userId) {
        if (USE_MOCK) {
            const list = await mockDB.findPendingByRecipient(userId);
            return list.map((f) => {
                const requesterUser = mockDB.findById(f.requester);
                return {
                    ...f,
                    requester: requesterUser,
                };
            });
        }
        return Friendship.find({ recipient: userId, status: 'pending' })
            .populate('requester', 'username avatar status')
            .lean()
            .exec();
    }
    async updateStatus(requesterId, recipientId, status) {
        if (USE_MOCK) {
            await mockDB.updateFriendshipStatus(requesterId, recipientId, status);
            return;
        }
        await Friendship.updateOne({ requester: requesterId, recipient: recipientId }, { status }).exec();
    }
    async deleteBetween(userA, userB) {
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
