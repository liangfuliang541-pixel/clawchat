import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { messageApi } from '../lib/api';
import type { Message } from '@clawchat/shared';

export const ChatArea = () => {
  const { user } = useAuthStore();
  const {
    currentConversationId,
    messages,
    typing,
    connected,
    setConnected,
    appendMessage,
    setMessages,
    markMessageAsRead,
    setTyping,
  } = useChatStore();
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history when conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    setLoadingHistory(true);
    messageApi
      .getHistory(currentConversationId, { limit: 50 })
      .then((res) => setMessages(currentConversationId, res.items))
      .finally(() => {
        setLoadingHistory(false);
        setTimeout(scrollToBottom, 50);
      });
  }, [currentConversationId, setMessages]);

  // Socket connection
  useEffect(() => {
    if (!user) return;
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
    const token = localStorage.getItem('clawchat_token');

    const socket = io(apiUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (msg: Message) => {
      appendMessage(msg.conversationId, msg);
      if (msg.conversationId === currentConversationId) {
        setTimeout(scrollToBottom, 50);
      }
    });

    socket.on('message_read', ({ messageId }: { messageId: string }) => {
      markMessageAsRead(messageId);
    });

    socket.on('user_typing', ({ conversationId }: { conversationId: string }) => {
      setTyping(conversationId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTyping(conversationId, false), 2000);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, currentConversationId, appendMessage, markMessageAsRead, setTyping, setConnected]);

  // Join/leave room when conversation changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    // Leave previous rooms (simple approach: emit leave for all known conversations)
    Object.keys(messages).forEach((cid) => socket.emit('leave_conversation', cid));

    if (currentConversationId) {
      socket.emit('join_conversation', currentConversationId);
    }
  }, [currentConversationId, connected, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !currentConversationId || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId: currentConversationId,
      content,
      type: 'text',
    });
    setInput('');
  };

  const handleTyping = useCallback(() => {
    if (!socketRef.current || !currentConversationId) return;
    socketRef.current.emit('typing', { conversationId: currentConversationId });
  }, [currentConversationId]);

  const currentMessages = currentConversationId ? messages[currentConversationId] || [] : [];
  const isTyping = currentConversationId ? typing[currentConversationId] : false;

  if (!currentConversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">选择一个对话开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">聊天</h3>
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
            title={connected ? '已连接' : '未连接'}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loadingHistory && (
          <div className="py-2 text-center text-xs text-gray-400">加载历史消息...</div>
        )}
        <div className="space-y-3">
          {currentMessages.map((msg) => {
            const isMe = msg.sender === user?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md rounded-2xl px-4 py-2 shadow-sm ${
                    isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={`mt-1 text-right text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isMe && msg.isRead && <span className="ml-1">已读</span>}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                对方正在输入…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="输入消息..."
            disabled={!connected}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
};
