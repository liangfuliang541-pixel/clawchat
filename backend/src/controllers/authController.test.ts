import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { register, login, getProfile } from './authController.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// Mock User model
vi.mock('../models/User.js');
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));
vi.mock('../config/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('authController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
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

      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token');

      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              username: 'testuser',
              email: 'test@example.com',
            }),
            token: 'mock-token',
          }),
        })
      );
    });

    it('should return 409 if user already exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ email: 'test@example.com' } as any);

      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User already exists',
        })
      );
    });

    it('should return 400 for invalid email', async () => {
      req.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for short password', async () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // Less than 6 chars
      };

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
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
        save: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token');

      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(req as Request, res as Response);

      expect(res.status).not.toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com',
            }),
            token: 'mock-token',
          }),
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid credentials',
        })
      );
    });

    it('should return 400 for invalid email format', async () => {
      req.body = {
        email: 'not-an-email',
        password: 'password123',
      };

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
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

      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      } as any);

      req.userId = 'user123';

      await getProfile(req as any, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com',
          }),
        })
      );
    });

    it('should return 404 if user not found', async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      req.userId = 'nonexistent';

      await getProfile(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found',
        })
      );
    });
  });
});
