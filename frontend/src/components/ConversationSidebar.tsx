import { useEffect, useState } from 'react';
import { conversationApi } from '../lib/api';
import { useConversationStore } from '../store/conversationStore';
import { useChatStore } from '../store/chatStore';

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
    <aside className="flex w-full flex-col border-r border-gray-200 bg-white md:w-80">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-bold text-indigo-600">🦞 ClawChat</h2>
        <button
          onClick={onLogout}
          className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          退出
        </button>
      </div>

      <div className="px-4 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索对话..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-4 text-center text-sm text-gray-500">加载中...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400">暂无对话</div>
        )}
        {filtered.map((conv) => (
          <button
            key={conv._id}
            onClick={() => setCurrentConversation(conv._id)}
            className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
              currentConversationId === conv._id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {(conv.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate font-medium text-gray-900">{conv.name || '私聊'}</span>
                <span className="text-xs text-gray-400">{formatTime(conv.updatedAt)}</span>
              </div>
              <div className="truncate text-sm text-gray-500">
                {(conv as any).lastMessage?.content || '暂无消息'}
              </div>
            </div>
            {(conv as any).unreadCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {(conv as any).unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
        当前用户: {username || '-'}
      </div>
    </aside>
  );
};
