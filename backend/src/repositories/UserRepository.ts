import { User } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';
import { mockDB } from '../config/mockDatabase.js';
import type { IUserDoc } from '../models/User.js';

const USE_MOCK = process.env.USE_MOCK_DB === 'true';

export class UserRepository extends BaseRepository<IUserDoc> {
  constructor() {
    super(User);
  }

  async create(data: Partial<IUserDoc>): Promise<IUserDoc> {
    if (USE_MOCK) {
      return mockDB.createUser(data as any) as unknown as Promise<IUserDoc>;
    }
    return super.create(data);
  }

  async findById(id: string): Promise<IUserDoc | null> {
    if (USE_MOCK) {
      return (await mockDB.findById(id)) as unknown as IUserDoc | null;
    }
    return super.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDoc | null> {
    if (USE_MOCK) {
      return (await mockDB.findByEmail(email)) as unknown as IUserDoc | null;
    }
    return User.findOne({ email }).lean<IUserDoc>().exec();
  }

  async findByUsername(username: string): Promise<IUserDoc | null> {
    if (USE_MOCK) {
      const user = Array.from((mockDB as any).users.values()).find(
        (u: any) => u.username === username
      );
      return (user || null) as unknown as IUserDoc | null;
    }
    return User.findOne({ username }).lean<IUserDoc>().exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUserDoc | null> {
    if (USE_MOCK) {
      const user = await mockDB.findByEmail(email);
      if (!user) return null;
      return {
        ...user,
        comparePassword: (candidate: string) => mockDB.comparePassword(user._id, candidate),
      } as unknown as IUserDoc;
    }
    return User.findOne({ email }).select('+password').exec();
  }

  async findByIdWithPassword(id: string): Promise<IUserDoc | null> {
    if (USE_MOCK) {
      const user = await mockDB.findById(id);
      if (!user) return null;
      return {
        ...user,
        comparePassword: (candidate: string) => mockDB.comparePassword(user._id, candidate),
      } as unknown as IUserDoc;
    }
    return User.findById(id).select('+password').exec();
  }

  async updateStatus(userId: string, status: IUserDoc['status']): Promise<void> {
    if (USE_MOCK) {
      await mockDB.updateStatus(userId, status);
      return;
    }
    await User.findByIdAndUpdate(userId, { status }).exec();
  }

  async existsByEmailOrUsername(email: string, username: string): Promise<boolean> {
    if (USE_MOCK) {
      const byEmail = await mockDB.findByEmail(email);
      if (byEmail) return true;
      const byUsername = Array.from((mockDB as any).users.values()).find(
        (u: any) => u.username === username
      );
      return !!byUsername;
    }
    const count = await User.countDocuments({ $or: [{ email }, { username }] }).exec();
    return count > 0;
  }

  async search(keyword: string, limit = 20): Promise<IUserDoc[]> {
    if (USE_MOCK) {
      const regex = new RegExp(keyword, 'i');
      return Array.from((mockDB as any).users.values())
        .filter((u: any) => regex.test(u.username) || regex.test(u.email))
        .slice(0, limit) as unknown as IUserDoc[];
    }
    const regex = new RegExp(keyword, 'i');
    return User.find({
      $or: [{ username: regex }, { email: regex }],
    })
      .limit(limit)
      .select('-password')
      .lean<IUserDoc[]>()
      .exec();
  }
}

export const userRepository = new UserRepository();
