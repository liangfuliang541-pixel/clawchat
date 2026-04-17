import { userRepository } from '../repositories/index.js';
import { NotFoundError } from '../utils/AppError.js';
const toUserResponse = (user) => ({
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
export class UserService {
    async searchUsers(keyword, limit = 20) {
        const regex = new RegExp(keyword, 'i');
        const users = await userRepository.search(keyword, limit);
        return users.map(toUserResponse);
    }
    async updateProfile(userId, data) {
        const updated = await userRepository.update(userId, data);
        if (!updated)
            throw new NotFoundError('User');
        return toUserResponse(updated);
    }
}
export const userService = new UserService();
