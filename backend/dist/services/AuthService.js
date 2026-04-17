import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { userRepository } from '../repositories/index.js';
import { ConflictError, AuthenticationError, NotFoundError } from '../utils/AppError.js';
const JWT_EXPIRES_IN = '7d';
const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const signToken = (userId) => jwt.sign({ userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
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
export class AuthService {
    userRepo;
    constructor(userRepo = userRepository) {
        this.userRepo = userRepo;
    }
    async register(data) {
        const parsed = registerSchema.parse(data);
        const exists = await this.userRepo.existsByEmailOrUsername(parsed.email, parsed.username);
        if (exists) {
            throw new ConflictError('User already exists');
        }
        const user = await this.userRepo.create(parsed);
        const token = signToken(user._id.toString());
        return {
            success: true,
            data: { user: toUserResponse(user), token },
        };
    }
    async login(data) {
        const parsed = loginSchema.parse(data);
        const user = await this.userRepo.findByEmailWithPassword(parsed.email);
        if (!user) {
            throw new AuthenticationError('Invalid credentials');
        }
        const valid = await user.comparePassword?.(parsed.password);
        if (!valid) {
            throw new AuthenticationError('Invalid credentials');
        }
        await this.userRepo.updateStatus(user._id.toString(), 'online');
        const token = signToken(user._id.toString());
        return {
            success: true,
            data: { user: toUserResponse({ ...user, status: 'online' }), token },
        };
    }
    async getProfile(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }
        return {
            success: true,
            data: toUserResponse(user),
        };
    }
}
export const authService = new AuthService();
