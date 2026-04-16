import { create } from 'zustand';
import type { Message } from '@clawchat/shared';

interface ChatState {
  messages: Record<string, Message[]>;
  currentConversationId: string | null;
  typing: Record<string, boolean>;
  connected: boolean;

  setConnected: (v: boolean) => void;
  setCurrentConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  appendMessage: (conversationId: string, message: Message) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;
  markMessageAsRead: (messageId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: {},
  currentConversationId: null,
  typing: {},
  connected: false,

  setConnected: (connected) => set({ connected }),
  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  appendMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),
  prependMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...messages, ...(state.messages[conversationId] || [])],
      },
    })),
  markMessageAsRead: (messageId) =>
    set((state) => {
      const next: Record<string, Message[]> = {};
      for (const [cid, list] of Object.entries(state.messages)) {
        next[cid] = list.map((m) => (m._id === messageId ? { ...m, isRead: true } : m));
      }
      return { messages: next };
    }),
  setTyping: (conversationId, isTyping) =>
    set((state) => ({
      typing: { ...state.typing, [conversationId]: isTyping },
    })),
}));
