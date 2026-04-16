import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationService } from './ConversationService.js';
import { conversationRepository } from '../repositories/ConversationRepository.js';
import { messageRepository } from '../repositories/MessageRepository.js';
import { ConflictError, NotFoundError } from '../utils/AppError.js';

vi.mock('../repositories/ConversationRepository.js', () => ({
  ConversationRepository: vi.fn(),
  conversationRepository: {
    findById: vi.fn(),
    findByParticipant: vi.fn(),
    findPrivateBetween: vi.fn(),
    create: vi.fn(),
    addParticipant: vi.fn(),
    removeParticipant: vi.fn(),
    updateLastMessage: vi.fn(),
  },
}));

vi.mock('../repositories/MessageRepository.js', () => ({
  MessageRepository: vi.fn(),
  messageRepository: {
    countUnread: vi.fn(),
  },
}));

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConversationService();
  });

  it('should create private conversation', async () => {
    vi.mocked(conversationRepository.findPrivateBetween).mockResolvedValue(null);
    vi.mocked(conversationRepository.create).mockResolvedValue({
      _id: { toString: () => 'conv1' },
      participants: ['u1', 'u2'],
      type: 'private',
      updatedAt: new Date(),
    } as any);

    const result = await service.createPrivate('u1', 'u2');
    expect(result.type).toBe('private');
  });

  it('should return existing private conversation', async () => {
    vi.mocked(conversationRepository.findPrivateBetween).mockResolvedValue({
      _id: { toString: () => 'conv1' },
      participants: ['u1', 'u2'],
      type: 'private',
      updatedAt: new Date(),
    } as any);

    const result = await service.createPrivate('u1', 'u2');
    expect(conversationRepository.create).not.toHaveBeenCalled();
    expect(result.type).toBe('private');
  });

  it('should throw ConflictError when creating conversation with self', async () => {
    await expect(service.createPrivate('u1', 'u1')).rejects.toThrow(ConflictError);
  });

  it('should get conversations with unread counts', async () => {
    vi.mocked(conversationRepository.findByParticipant).mockResolvedValue([
      {
        _id: { toString: () => 'conv1' },
        participants: ['u1', 'u2'],
        type: 'private',
        updatedAt: new Date(),
      },
    ] as any);
    vi.mocked(messageRepository.countUnread).mockResolvedValue(3);

    const result = await service.getConversations('u1');
    expect(result).toHaveLength(1);
    expect(messageRepository.countUnread).toHaveBeenCalledWith('conv1', 'u1');
  });
});
