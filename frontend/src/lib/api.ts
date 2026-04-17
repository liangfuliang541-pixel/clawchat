import type {
  Conversation,
  Message,
  User,
  RegisterDTO,
  LoginDTO,
  AuthResponse,
} from '@clawchat/shared';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('clawchat_token');
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.data as T;
}

export const authApi = {
  login: (data: LoginDTO) =>
    fetchJson<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterDTO) =>
    fetchJson<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchJson<User>('/auth/profile'),
};

export const conversationApi = {
  getList: () => fetchJson<Conversation[]>('/conversations'),
  create: (payload: { name?: string; participants: string[]; isGroup?: boolean }) =>
    fetchJson<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const messageApi = {
  getHistory: (conversationId: string, params?: { limit?: number; before?: string }) =>
    fetchJson<{ items: Message[]; nextCursor?: string }>(
      `/messages/${conversationId}?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
};

export interface HermesAgentConfig {
  _id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model?: string;
  enabled: boolean;
  autoReply?: boolean;
  systemPrompt?: string;
}

export const hermesApi = {
  listAgents: () =>
    fetchJson<Pick<HermesAgentConfig, '_id' | 'name' | 'enabled' | 'autoReply'>[]>('/hermes'),
  registerAgent: (data: Omit<HermesAgentConfig, '_id'>) =>
    fetchJson<{ id: string }>('/hermes/register', { method: 'POST', body: JSON.stringify(data) }),
  triggerAgent: (
    agentId: string,
    conversationId: string,
    history: { role: string; content: string }[]
  ) =>
    fetchJson<{ content: string | null }>('/hermes/trigger', {
      method: 'POST',
      body: JSON.stringify({ agentId, conversationId, history }),
    }),
};
