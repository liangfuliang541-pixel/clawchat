import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import type { Message } from '@clawchat/shared';

export const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const conversationId = user ? `conv_default_${user._id}` : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
    const token = localStorage.getItem('clawchat_token');

    const socket = io(apiUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_conversation', conversationId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', ({ userId }) => {
      if (userId !== user._id) {
        setIsTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.emit('leave_conversation', conversationId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, navigate, conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId,
      content,
      type: 'text',
    });

    setInputValue('');
  };

  const handleTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { conversationId });
  }, [conversationId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-indigo-600">🦞 ClawChat</h1>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-gray-400'
              }`}
              title={connected ? '已连接' : '未连接'}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">欢迎来到 ClawChat</p>
                <p className="mt-2 text-gray-500">开始发送消息吧</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender === user!._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2 shadow-sm ${
                        isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isMe ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleTyping();
              }}
              placeholder="输入消息..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !connected}
              className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
            >
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
