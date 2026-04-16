import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import type { Message } from '@clawchat/shared';

export const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Initialize Socket.IO connection
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '');
    socketRef.current = io(apiUrl, {
      query: { userId: user._id },
      auth: {
        token: localStorage.getItem('clawchat_token'),
      },
    });

    // Example conversation ID (in real app, would come from conversation list)
    const conversationId = 'conv_default_' + user._id;

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to Socket.IO');
      socketRef.current?.emit('join_conversation', conversationId);
    });

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('user_typing', ({ userId }) => {
      if (userId !== user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socketRef.current.on('user_status_changed', ({ userId, status }) => {
      console.log(`User ${userId} is ${status}`);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_conversation', conversationId);
        socketRef.current.disconnect();
      }
    };
  }, [user, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const conversationId = 'conv_default_' + user!._id;
    socketRef.current.emit('send_message', {
      conversationId,
      content: inputValue,
      type: 'text',
      receiver: user!._id, // For demo, sending to self
    });

    setInputValue('');
  };

  const handleTyping = () => {
    if (!socketRef.current) return;
    const conversationId = 'conv_default_' + user!._id;
    socketRef.current.emit('typing', { conversationId });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('clawchat_token');
    navigate('/');
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-indigo-600">🦞 ClawChat</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
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
                <p className="mt-2 text-gray-600">开始发送消息吧</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.sender === user!._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      msg.sender === user!._id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        msg.sender === user!._id
                          ? 'text-indigo-100'
                          : 'text-gray-600'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-4 py-2 text-gray-600 text-sm">
                    对方正在输入...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 bg-white px-6 py-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={handleTyping}
              placeholder="输入消息..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
            >
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
