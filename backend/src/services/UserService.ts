import { userRepository } from '../repositories/index.js';
import { NotFoundError } from '../utils/AppError.js';
import type { User } from '@clawchat/shared';

const toUserResponse = (user: any): User => ({
  _id: user._id.toString?.() || user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar || '',
  bio: user.bio || '',
  status: user.status,
  createdAt: user.createdAt?.toISOString?.() || user.createdAt,
  updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt,
});

export class UserService {
  async searchUsers(keyword: string, limit = 20): Promise<User[]> {
    const regex = new RegExp(keyword, 'i');
    const users = await userRepository.search(keyword, limit);
    return users.map(toUserResponse);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const updated = await userRepository.update(userId, data);
    if (!updated) throw new NotFoundError('User');
    return toUserResponse(updated);
  }
}

export const userService = new UserService();
