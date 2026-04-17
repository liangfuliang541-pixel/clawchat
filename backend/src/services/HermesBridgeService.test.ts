import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HermesBridgeService } from './HermesBridgeService.js';
import { hermesConfigRepository } from '../repositories/HermesConfigRepository.js';
import { mockDB } from '../config/mockDatabase.js';

// Mock repository methods
vi.mock('../repositories/HermesConfigRepository.js', () => ({
  hermesConfigRepository: {
    findEnabled: vi.fn(),
    upsertByName: vi.fn(),
    deleteByName: vi.fn(),
  },
}));

vi.mock('../config/mockDatabase.js', () => ({
  mockDB: {
    hermesConfigs: new Map(),
    findHermesConfigs: vi.fn(),
    upsertHermesConfig: vi.fn(),
    deleteHermesConfig: vi.fn(),
    findHermesConfigByName: vi.fn(),
  },
}));

const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe('HermesBridgeService', () => {
  let service: HermesBridgeService;

  beforeEach(() => {
    service = new HermesBridgeService();
    mockFetch.mockClear();
    vi.mocked(hermesConfigRepository.findEnabled).mockReset();
    vi.mocked(hermesConfigRepository.upsertByName).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads agents from DB on startup', async () => {
    vi.mocked(hermesConfigRepository.findEnabled).mockResolvedValue([
      {
        _id: '1',
        name: 'TestAgent',
        baseUrl: 'http://localhost:8080',
        apiKey: 'sk-test',
        enabled: true,
      } as any,
    ]);

    await service.loadFromDB();
    const agents = service.getAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('TestAgent');
  });

  it('registers and persists an agent', async () => {
    vi.mocked(hermesConfigRepository.upsertByName).mockResolvedValue({
      _id: 'abc',
      name: 'MyAgent',
      baseUrl: 'http://localhost',
      apiKey: 'key',
      enabled: true,
    });

    await service.register({
      name: 'MyAgent',
      baseUrl: 'http://localhost',
      apiKey: 'key',
      enabled: true,
    });
    expect(service.getAgents()).toHaveLength(1);
  });

  it('invokes agent API with correct payload', async () => {
    service['configs'].set('a1', {
      _id: 'a1',
      name: 'Agent',
      baseUrl: 'http://agent.local',
      apiKey: 'sk',
      enabled: true,
      systemPrompt: 'Be helpful',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello from agent' } }] }),
    });

    const result = await service.invoke('a1', 'conv-1', [{ role: 'user', content: 'Hi' }]);

    expect(result).toBe('Hello from agent');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://agent.local/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"model":"hermes-agent"'),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('returns null when agent API errors', async () => {
    service['configs'].set('a2', {
      _id: 'a2',
      name: 'BadAgent',
      baseUrl: 'http://bad',
      apiKey: 'sk',
      enabled: true,
    });
    mockFetch.mockResolvedValue({ ok: false, text: async () => 'Internal error' });

    const result = await service.invoke('a2', 'conv-1', [{ role: 'user', content: 'Hi' }]);
    expect(result).toBeNull();
  });

  it('returns null on timeout', async () => {
    service['configs'].set('a3', {
      _id: 'a3',
      name: 'SlowAgent',
      baseUrl: 'http://slow',
      apiKey: 'sk',
      enabled: true,
    });
    mockFetch.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('Timeout', 'AbortError')), 50);
        })
    );

    const result = await service.invoke('a3', 'conv-1', [{ role: 'user', content: 'Hi' }]);
    expect(result).toBeNull();
  });

  it('builds OpenAI-format history correctly', () => {
    const messages = [
      {
        _id: 'm1',
        sender: { _id: 'u1' },
        content: 'Hello',
        type: 'text',
        conversationId: 'c1',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'm2',
        sender: 'agent-1',
        content: 'Hi there',
        type: 'text',
        conversationId: 'c1',
        createdAt: new Date().toISOString(),
      },
    ] as any[];

    const history = HermesBridgeService.buildHistory(messages, 'u1', 'agent-1');
    expect(history).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);
  });
});
