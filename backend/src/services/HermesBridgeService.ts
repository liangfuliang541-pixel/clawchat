import { logger } from '../config/logger.js';
import { messageService } from './MessageService.js';
import { conversationRepository } from '../repositories/index.js';
import { hermesConfigRepository } from '../repositories/HermesConfigRepository.js';
import type { Message } from '@clawchat/shared';

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

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const INVOKE_TIMEOUT_MS = 15000;

export class HermesBridgeService {
  private configs = new Map<string, HermesAgentConfig>();

  async loadFromDB(): Promise<void> {
    try {
      const docs = await hermesConfigRepository.findEnabled();
      for (const doc of docs) {
        const cfg: HermesAgentConfig = {
          _id: doc._id.toString(),
          name: doc.name,
          baseUrl: doc.baseUrl,
          apiKey: doc.apiKey,
          model: doc.agentModel,
          enabled: doc.enabled,
          autoReply: doc.autoReply,
          systemPrompt: doc.systemPrompt,
        };
        this.configs.set(cfg._id || cfg.name, cfg);
      }
      logger.info({ count: docs.length }, 'Hermes agents loaded from DB');
    } catch (err) {
      logger.error({ err }, 'Failed to load Hermes agents from DB');
    }
  }

  async register(config: HermesAgentConfig): Promise<void> {
    const saved = await hermesConfigRepository.upsertByName({
      name: config.name,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      agentModel: config.model,
      enabled: config.enabled,
      autoReply: config.autoReply,
      systemPrompt: config.systemPrompt,
    });
    const savedId = typeof saved._id === 'string' ? saved._id : saved._id.toString();
    this.configs.set(savedId || config.name, { ...config, _id: savedId });
    logger.info({ agent: config.name }, 'Hermes agent registered');
  }

  async unregister(id: string): Promise<void> {
    const cfg = this.configs.get(id);
    if (cfg) {
      await hermesConfigRepository.deleteByName(cfg.name);
    }
    this.configs.delete(id);
    logger.info({ agentId: id }, 'Hermes agent unregistered');
  }

  getAgents(): HermesAgentConfig[] {
    return Array.from(this.configs.values());
  }

  async invoke(
    agentId: string,
    conversationId: string,
    history: ChatMessage[]
  ): Promise<string | null> {
    const config = this.configs.get(agentId);
    if (!config || !config.enabled) {
      logger.warn({ agentId }, 'Hermes agent not found or disabled');
      return null;
    }

    const url = `${config.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
    const model = config.model || 'hermes-agent';

    const messages: ChatMessage[] = [];
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: config.systemPrompt });
    }
    messages.push(...history);

    try {
      logger.info(
        { agent: config.name, conversationId, messageCount: messages.length },
        'Calling Hermes Agent'
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), INVOKE_TIMEOUT_MS);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown');
        logger.error({ status: res.status, errText, agent: config.name }, 'Hermes Agent API error');
        return null;
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        logger.warn({ agent: config.name }, 'Hermes Agent returned empty content');
        return null;
      }

      logger.info({ agent: config.name, contentLength: content.length }, 'Hermes Agent responded');
      return content;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        logger.error({ agent: config.name }, 'Hermes Agent call timed out');
      } else {
        logger.error({ err, agent: config.name }, 'Hermes Agent call failed');
      }
      return null;
    }
  }

  async invokeAndPersist(
    agentId: string,
    conversationId: string,
    agentUserId: string,
    history: ChatMessage[]
  ): Promise<Message | null> {
    const content = await this.invoke(agentId, conversationId, history);
    if (!content) return null;

    const message = await messageService.sendMessage({
      senderId: agentUserId,
      conversationId,
      content,
      type: 'text',
    });

    return message;
  }

  static buildHistory(
    messages: Message[],
    currentUserId: string,
    agentUserId: string
  ): ChatMessage[] {
    return messages.map((m) => {
      const senderId = typeof m.sender === 'object' ? m.sender._id : m.sender;
      const role: ChatMessage['role'] = senderId === agentUserId ? 'assistant' : 'user';
      return { role, content: m.content };
    });
  }
}

export const hermesBridgeService = new HermesBridgeService();
