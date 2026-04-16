import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ConflictError, AuthenticationError, NotFoundError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-token'),
    verify: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = {
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findById: vi.fn(),
      existsByEmailOrUsername: vi.fn(),
      updateStatus: vi.fn(),
    };
    authService = new AuthService(userRepo as any);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      vi.mocked(userRepo.existsByEmailOrUsername).mockResolvedValue(false);
      const mockUser = {
        _id: { toString: () => 'user123' },
        username: 'testuser',
        email: 'test@example.com',
        avatar: '',
        bio: '',
        status: 'offline',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(userRepo.create).mockResolvedValue(mockUser as any);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('mock-token');
      expect(result.data.user.username).toBe('testuser');
    });

    it('should throw ConflictError if user exists', async () => {
      vi.mocked(userRepo.existsByEmailOrUsername).mockResolvedValue(true);

      await expect(
        authService.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        username: 'testuser',
        email: 'test@example.com',
        avatar: '',
        bio: '',
        status: 'offline',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(userRepo.findByEmailWithPassword).mockResolvedValue(mockUser as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.status).toBe('online');
      expect(userRepo.updateStatus).toHaveBeenCalledWith('user123', 'online');
    });

    it('should throw AuthenticationError for invalid password', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        comparePassword: vi.fn().mockResolvedValue(false),
      };
      vi.mocked(userRepo.findByEmailWithPassword).mockResolvedValue(mockUser as any);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError if user not found', async () => {
      vi.mocked(userRepo.findByEmailWithPassword).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        username: 'testuser',
        email: 'test@example.com',
        avatar: '',
        bio: '',
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(userRepo.findById).mockResolvedValue(mockUser as any);

      const result = await authService.getProfile('user123');
      expect(result.success).toBe(true);
      expect(result.data.username).toBe('testuser');
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
