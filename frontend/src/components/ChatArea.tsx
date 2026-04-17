import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { messageApi } from '../lib/api';
import type { Message, User } from '@clawchat/shared';

type SendStatus = 'idle' | 'sending' | 'sent' | 'failed';

function getSenderInfo(msg: Message): {
  id: string;
  kind: 'human' | 'agent';
  username: string;
  agentType?: string;
} {
  if (typeof msg.sender === 'object' && msg.sender !== null) {
    const u = msg.sender as User;
    return {
      id: u._id,
      kind: u.kind || 'human',
      username: u.username,
      agentType: u.agentType,
    };
  }
  return { id: msg.sender as string, kind: 'human', username: '' };
}

function getSenderId(msg: Message): string {
  return typeof msg.sender === 'object' && msg.sender !== null
    ? (msg.sender as User)._id
    : (msg.sender as string);
}

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
    recallMessage,
    setTyping,
  } = useChatStore();
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');

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
    const socketUrl =
      (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace('/api', '') || undefined;
    const token = localStorage.getItem('clawchat_token');

    const socket = io(socketUrl, {
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

    socket.on('message_recalled', ({ messageId }: { messageId: string }) => {
      recallMessage(messageId);
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
  }, [
    user,
    currentConversationId,
    appendMessage,
    markMessageAsRead,
    recallMessage,
    setTyping,
    setConnected,
  ]);

  // Join/leave room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    Object.keys(messages).forEach((cid) => socket.emit('leave_conversation', cid));
    if (currentConversationId) {
      socket.emit('join_conversation', currentConversationId);
    }
  }, [currentConversationId, connected, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !currentConversationId || !socketRef.current) return;

    setSendStatus('sending');

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      sender: user?._id || '',
      receiver: '',
      conversationId: currentConversationId,
      content,
      type: 'text',
      isRead: false,
      replyTo: replyingTo?._id,
      createdAt: new Date().toISOString(),
    };
    appendMessage(currentConversationId, optimisticMsg);
    setInput('');
    setReplyingTo(null);
    setTimeout(scrollToBottom, 50);

    socketRef.current.emit('send_message', {
      conversationId: currentConversationId,
      content,
      type: 'text',
      replyTo: replyingTo?._id,
    });

    setTimeout(() => setSendStatus('sent'), 300);
  };

  const handleTyping = useCallback(() => {
    if (!socketRef.current || !currentConversationId) return;
    socketRef.current.emit('typing', { conversationId: currentConversationId });
  }, [currentConversationId]);

  const handleRecall = (messageId: string) => {
    if (!socketRef.current || !currentConversationId) return;
    socketRef.current.emit('recall_message', {
      messageId,
      conversationId: currentConversationId,
    });
  };

  const canRecall = (msg: Message) => {
    const senderId = getSenderId(msg);
    if (senderId !== user?._id) return false;
    const elapsed = Date.now() - new Date(msg.createdAt).getTime();
    return elapsed < 2 * 60 * 1000; // 2 minutes
  };

  const currentMessages = currentConversationId ? messages[currentConversationId] || [] : [];
  const isTyping = currentConversationId ? typing[currentConversationId] : false;

  if (!currentConversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-hermes-cream">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hermes-parchment">
            <span className="text-2xl">✉️</span>
          </div>
          <p className="text-base font-semibold text-hermes-brown">选择一个对话</p>
          <p className="mt-1 text-sm text-hermes-ink-muted">开始一场精心雕琢的交流</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-hermes-cream">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hermes-cream-dark bg-white px-6 py-3.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold tracking-wide text-hermes-brown uppercase">聊天</h3>
          <span
            className={`status-dot ${connected ? 'online' : 'bg-hermes-ink-muted'}`}
            title={connected ? '已连接' : '未连接'}
          />
          {!connected && <span className="text-[11px] text-hermes-ink-muted">重连中…</span>}
        </div>
        {sendStatus === 'sending' && (
          <span className="animate-pulse-soft text-[11px] text-hermes-gold">发送中…</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loadingHistory && (
          <div className="py-2 text-center text-[11px] uppercase tracking-wider text-hermes-ink-muted">
            加载历史消息…
          </div>
        )}
        <div className="space-y-4">
          {currentMessages.map((msg, idx) => {
            const sender = getSenderInfo(msg);
            const senderId = getSenderId(msg);
            const isMe = senderId === user?._id;
            const isTemp = msg._id.startsWith('temp-');
            const isAgent = sender.kind === 'agent';
            const isRecalled = msg.isRecalled;
            const showAvatar = idx === 0 || getSenderId(currentMessages[idx - 1]) !== senderId;
            const replyTarget = msg.replyTo
              ? currentMessages.find((m) => m._id === msg.replyTo)
              : undefined;

            return (
              <div
                key={msg._id}
                className={`group flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex max-w-[70%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {showAvatar && !isMe && (
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isAgent
                          ? 'bg-hermes-orange/10 text-hermes-orange'
                          : 'bg-hermes-parchment text-hermes-brown'
                      }`}
                    >
                      {isAgent ? '🤖' : sender.username.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  {!showAvatar && !isMe && <div className="w-8 shrink-0" />}

                  {/* Bubble */}
                  <div
                    className={`${isMe ? 'msg-out' : 'msg-in'} ${isTemp ? 'opacity-70' : ''} relative`}
                  >
                    {/* Agent label */}
                    {isAgent && showAvatar && (
                      <div className="mb-1 flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-hermes-orange">
                          {sender.username}
                        </span>
                        {sender.agentType && (
                          <span className="rounded bg-hermes-orange/10 px-1 text-[9px] text-hermes-orange">
                            {sender.agentType}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reply reference */}
                    {replyTarget && (
                      <div
                        className={`mb-1.5 rounded-md border-l-2 ${isMe ? 'border-white/40 bg-white/10' : 'border-hermes-gold/60 bg-hermes-parchment/50'} px-2 py-1`}
                      >
                        <p className="truncate text-[11px] opacity-80">
                          {replyTarget.isRecalled ? '消息已撤回' : replyTarget.content}
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    {isRecalled ? (
                      <p className="text-[15px] leading-relaxed opacity-60 italic">消息已撤回</p>
                    ) : (
                      <p className="text-[15px] leading-relaxed">{msg.content}</p>
                    )}

                    <div
                      className={`mt-1.5 flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <span
                        className={`text-[10px] ${isMe ? 'text-white/70' : 'text-hermes-ink-muted'}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && !isTemp && !isRecalled && (
                        <span
                          className={`text-[10px] ${msg.isRead ? 'text-white/90' : 'text-white/50'}`}
                        >
                          {msg.isRead ? '已读' : '送达'}
                        </span>
                      )}
                      {isTemp && (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                    </div>

                    {/* Hover actions */}
                    {!isRecalled && !isTemp && (
                      <div
                        className={`absolute -top-6 ${isMe ? 'left-0' : 'right-0'} hidden gap-1 group-hover:flex`}
                      >
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="rounded bg-white px-1.5 py-0.5 text-[10px] text-hermes-brown shadow-sm border border-hermes-cream-dark hover:text-hermes-orange"
                        >
                          回复
                        </button>
                        {canRecall(msg) && (
                          <button
                            onClick={() => handleRecall(msg._id)}
                            className="rounded bg-white px-1.5 py-0.5 text-[10px] text-hermes-brown shadow-sm border border-hermes-cream-dark hover:text-red-500"
                          >
                            撤回
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-hermes-cream-dark bg-white px-4 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-hermes-ink-muted"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-hermes-ink-muted"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-hermes-ink-muted"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-xs text-hermes-ink-muted">正在输入…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-hermes-cream-dark bg-white px-6 py-4">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-hermes-parchment/60 px-3 py-1.5">
            <span className="truncate text-xs text-hermes-brown">
              回复: {replyingTo.isRecalled ? '消息已撤回' : replyingTo.content}
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="ml-2 text-xs text-hermes-ink-muted hover:text-hermes-brown"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setInput((prev) => (prev ? prev + ' @agent' : '@agent '));
            }}
            title="召唤 Agent"
            className="shrink-0 rounded-lg border border-hermes-orange/30 px-3 py-2 text-xs font-semibold text-hermes-orange transition-colors hover:bg-hermes-orange/10"
          >
            @Agent
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="书写一条消息… 使用 @agent 召唤 Hermes"
            disabled={!connected}
            className="input-hermes flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="btn-hermes shrink-0 disabled:opacity-40 disabled:hover:shadow-none"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
