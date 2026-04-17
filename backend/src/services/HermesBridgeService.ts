import { logger } from '../config/logger.js';
import { messageService } from './MessageService.js';
import { conversationRepository } from '../repositories/index.js';
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

/**
 * 🐎 HermesBridgeService
 *
 * Bridges ClawChat conversations to external Hermes Agent instances
 * via their OpenAI-compatible API Server (/v1/chat/completions).
 *
 * Hermes Agent (by Nous Research) exposes:
 *   POST /v1/chat/completions  — standard OpenAI format
 *   POST /v1/responses         — stateful conversation (previous_response_id)
 *   GET  /v1/models            — model discovery
 *
 * This service calls the chat completions endpoint with the full
 * conversation history as the messages array.
 */
export class HermesBridgeService {
  private configs: Map<string, HermesAgentConfig> = new Map();

  register(config: HermesAgentConfig): void {
    this.configs.set(config._id || config.name, config);
    logger.info({ agent: config.name, baseUrl: config.baseUrl }, 'Hermes agent registered');
  }

  unregister(id: string): void {
    this.configs.delete(id);
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
      });

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
      logger.error({ err, agent: config.name }, 'Hermes Agent call failed');
      return null;
    }
  }

  /**
   * Invoke an agent and persist its reply as a message in the conversation.
   * Returns the created Message or null on failure.
   */
  async invokeAndPersist(
    agentId: string,
    conversationId: string,
    agentUserId: string, // The agent's User._id in ClawChat
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

  /**
   * Build OpenAI-format message history from ClawChat messages.
   * Maps ClawChat participants to 'user' and 'assistant' roles.
   */
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
