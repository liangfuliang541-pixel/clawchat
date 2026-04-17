import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageService } from './MessageService.js';
import { messageRepository } from '../repositories/MessageRepository.js';
import { conversationRepository } from '../repositories/ConversationRepository.js';
import { NotFoundError } from '../utils/AppError.js';
vi.mock('../repositories/MessageRepository.js', () => ({
    MessageRepository: vi.fn(),
    messageRepository: {
        create: vi.fn(),
        findByConversation: vi.fn(),
        markAsRead: vi.fn(),
        markConversationAsRead: vi.fn(),
        countUnread: vi.fn(),
    },
}));
vi.mock('../repositories/ConversationRepository.js', () => ({
    ConversationRepository: vi.fn(),
    conversationRepository: {
        findById: vi.fn(),
        updateLastMessage: vi.fn(),
    },
}));
describe('MessageService', () => {
    let service;
    beforeEach(() => {
        vi.clearAllMocks();
        service = new MessageService();
    });
    it('should send message', async () => {
        vi.mocked(conversationRepository.findById).mockResolvedValue({
            _id: 'conv1',
            participants: ['user1', 'user2'],
        });
        vi.mocked(messageRepository.create).mockResolvedValue({
            _id: { toString: () => 'msg1' },
            sender: 'user1',
            receiver: 'user2',
            conversationId: 'conv1',
            content: 'hello',
            type: 'text',
            isRead: false,
            createdAt: new Date('2024-01-01'),
        });
        const result = await service.sendMessage({
            senderId: 'user1',
            conversationId: 'conv1',
            content: 'hello',
        });
        expect(result.content).toBe('hello');
        expect(conversationRepository.updateLastMessage).toHaveBeenCalledWith('conv1', 'msg1');
    });
    it('should throw NotFoundError for invalid conversation', async () => {
        vi.mocked(conversationRepository.findById).mockResolvedValue(null);
        await expect(service.sendMessage({ senderId: 'user1', conversationId: 'bad', content: 'hi' })).rejects.toThrow(NotFoundError);
    });
});
