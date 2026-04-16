import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { register, login, getProfile } from './authController.js';
import { authService } from '../services/AuthService.js';

vi.mock('../services/AuthService.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
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
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, headers: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn() as unknown as NextFunction;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { username: 'testuser', email: 'test@example.com' },
          token: 'mock-token',
        },
      };
      vi.mocked(authService.register).mockResolvedValue(mockResponse as any);

      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('User already exists');
      vi.mocked(authService.register).mockRejectedValue(error);

      req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { email: 'test@example.com' },
          token: 'mock-token',
        },
      };
      vi.mocked(authService.login).mockResolvedValue(mockResponse as any);

      req.body = { email: 'test@example.com', password: 'password123' };
      await login(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValue(error);

      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      await login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockResponse = {
        success: true,
        data: { username: 'testuser', email: 'test@example.com' },
      };
      vi.mocked(authService.getProfile).mockResolvedValue(mockResponse as any);

      (req as any).userId = 'user123';
      await getProfile(req as any, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('User not found');
      vi.mocked(authService.getProfile).mockRejectedValue(error);

      (req as any).userId = 'nonexistent';
      await getProfile(req as any, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
