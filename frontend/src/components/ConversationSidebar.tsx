import { useEffect, useState } from 'react';
import { conversationApi } from '../lib/api';
import { useConversationStore } from '../store/conversationStore';
import { useChatStore } from '../store/chatStore';
import { AgentManager } from './AgentManager';

interface Props {
  onLogout: () => void;
  username?: string;
}

export const ConversationSidebar = ({ onLogout, username }: Props) => {
  const { conversations, loading, setConversations, setLoading } = useConversationStore();
  const { currentConversationId, setCurrentConversation } = useChatStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    conversationApi
      .getList()
      .then((list) => setConversations(list))
      .finally(() => setLoading(false));
  }, [setConversations, setLoading]);

  const filtered = conversations.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="flex w-full flex-col border-r border-hermes-cream-dark bg-white md:w-80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hermes-cream-dark px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🦞</span>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-hermes-brown uppercase">
              ClawChat
            </h2>
            <p className="text-[10px] tracking-widest text-hermes-ink-muted uppercase">Messenger</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-hermes-ink-muted transition-colors hover:bg-hermes-cream hover:text-hermes-brown"
        >
          退出
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-hermes-cream-dark px-5 py-3">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hermes-ink-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索对话…"
            className="input-hermes w-full pl-9 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-hermes-ink-muted">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-hermes-cream-dark border-t-hermes-orange" />
            加载中…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-hermes-ink-muted/60">暂无对话</div>
        )}
        {filtered.map((conv) => (
          <button
            key={conv._id}
            onClick={() => setCurrentConversation(conv._id)}
            className={`sidebar-item w-full ${currentConversationId === conv._id ? 'active' : ''}`}
          >
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hermes-parchment text-sm font-bold text-hermes-brown">
              {(conv.name || 'C').charAt(0).toUpperCase()}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-semibold text-hermes-brown">
                  {conv.name || '私聊'}
                </span>
                <span className="text-[11px] text-hermes-ink-muted">
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
              <div className="truncate text-[13px] text-hermes-ink-muted">
                {(conv as any).lastMessage?.content || '暂无消息'}
              </div>
            </div>

            {/* Unread badge */}
            {(conv as any).unreadCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-hermes-orange px-1.5 text-[11px] font-bold text-white">
                {(conv as any).unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AgentManager />

      {/* Footer */}
      <div className="border-t border-hermes-cream-dark px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="status-dot online" />
          <span className="text-[11px] text-hermes-ink-muted">{username || '-'}</span>
        </div>
      </div>
    </aside>
  );
};
