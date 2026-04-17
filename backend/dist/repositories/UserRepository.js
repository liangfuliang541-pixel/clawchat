import { User } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
const USE_MOCK = process.env.USE_MOCK_DB === 'true';
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }
    async create(data) {
        if (USE_MOCK) {
            return mockDB.createUser(data);
        }
        return super.create(data);
    }
    async findById(id) {
        if (USE_MOCK) {
            return (await mockDB.findById(id));
        }
        return super.findById(id);
    }
    async findByEmail(email) {
        if (USE_MOCK) {
            return (await mockDB.findByEmail(email));
        }
        return User.findOne({ email }).lean().exec();
    }
    async findByUsername(username) {
        if (USE_MOCK) {
            const user = Array.from(mockDB.users.values()).find((u) => u.username === username);
            return (user || null);
        }
        return User.findOne({ username }).lean().exec();
    }
    async findByEmailWithPassword(email) {
        if (USE_MOCK) {
            const user = await mockDB.findByEmail(email);
            if (!user)
                return null;
            return {
                ...user,
                comparePassword: (candidate) => mockDB.comparePassword(user._id, candidate),
            };
        }
        return User.findOne({ email }).select('+password').exec();
    }
    async findByIdWithPassword(id) {
        if (USE_MOCK) {
            const user = await mockDB.findById(id);
            if (!user)
                return null;
            return {
                ...user,
                comparePassword: (candidate) => mockDB.comparePassword(user._id, candidate),
            };
        }
        return User.findById(id).select('+password').exec();
    }
    async updateStatus(userId, status) {
        if (USE_MOCK) {
            await mockDB.updateStatus(userId, status);
            return;
        }
        await User.findByIdAndUpdate(userId, { status }).exec();
    }
    async existsByEmailOrUsername(email, username) {
        if (USE_MOCK) {
            const byEmail = await mockDB.findByEmail(email);
            if (byEmail)
                return true;
            const byUsername = Array.from(mockDB.users.values()).find((u) => u.username === username);
            return !!byUsername;
        }
        const count = await User.countDocuments({ $or: [{ email }, { username }] }).exec();
        return count > 0;
    }
    async search(keyword, limit = 20) {
        if (USE_MOCK) {
            const regex = new RegExp(keyword, 'i');
            return Array.from(mockDB.users.values())
                .filter((u) => regex.test(u.username) || regex.test(u.email))
                .slice(0, limit);
        }
        const regex = new RegExp(keyword, 'i');
        return User.find({
            $or: [{ username: regex }, { email: regex }],
        })
            .limit(limit)
            .select('-password')
            .lean()
            .exec();
    }
    async findByApiKey(apiKey) {
        if (USE_MOCK) {
            const agent = Array.from(mockDB.users.values()).find((u) => u.kind === 'agent' && u.apiKey === apiKey);
            return (agent || null);
        }
        const user = await User.findOne({ kind: 'agent' }).select('+apiKey').exec();
        if (!user || !user.apiKey)
            return null;
        const valid = await user.compareApiKey(apiKey);
        return valid ? user : null;
    }
    async findAgents() {
        if (USE_MOCK) {
            return Array.from(mockDB.users.values())
                .filter((u) => u.kind === 'agent')
                .slice(0, 100);
        }
        return User.find({ kind: 'agent' }).select('-password -apiKey').lean().exec();
    }
}
export const userRepository = new UserRepository();
