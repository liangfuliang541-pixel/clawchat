import { create } from 'zustand';
import type { Conversation } from '@clawchat/shared';

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setLoading: (loading: boolean) => void;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: [],
  loading: false,
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  setLoading: (loading) => set({ loading }),
}));
