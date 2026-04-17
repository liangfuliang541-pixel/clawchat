import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = { body: {}, headers: {} };
        res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
        next = vi.fn();
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
            vi.mocked(authService.register).mockResolvedValue(mockResponse);
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            await register(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });
        it('should call next with error on failure', async () => {
            const error = new Error('User already exists');
            vi.mocked(authService.register).mockRejectedValue(error);
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            await register(req, res, next);
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
            vi.mocked(authService.login).mockResolvedValue(mockResponse);
            req.body = { email: 'test@example.com', password: 'password123' };
            await login(req, res, next);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });
        it('should call next with error on failure', async () => {
            const error = new Error('Invalid credentials');
            vi.mocked(authService.login).mockRejectedValue(error);
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            await login(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe('getProfile', () => {
        it('should return user profile', async () => {
            const mockResponse = {
                success: true,
                data: { username: 'testuser', email: 'test@example.com' },
            };
            vi.mocked(authService.getProfile).mockResolvedValue(mockResponse);
            req.userId = 'user123';
            await getProfile(req, res, next);
            expect(res.json).toHaveBeenCalledWith(mockResponse);
        });
        it('should call next with error on failure', async () => {
            const error = new Error('User not found');
            vi.mocked(authService.getProfile).mockRejectedValue(error);
            req.userId = 'nonexistent';
            await getProfile(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
