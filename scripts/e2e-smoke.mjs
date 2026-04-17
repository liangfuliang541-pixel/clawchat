/**
 * E2E Smoke Test for ClawChat
 * Run: node scripts/e2e-smoke.mjs
 * Requires backend running on http://localhost:3001
 */

import { io } from 'socket.io-client';

const API = 'http://localhost:3001/api';
const SOCKET = 'http://localhost:3001';

let token = '';
let userId = '';
let conversationId = '';

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} failed: ${JSON.stringify(data)}`);
  return data;
}

async function registerAndLogin() {
  const email = `e2e_${Date.now()}@test.com`;
  const password = 'testpass123';

  // Register
  await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: `e2e_${Date.now()}`, email, password }),
  });

  // Login
  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  token = login.data.token;
  userId = login.data.user._id;
  console.log('✅ Login OK, userId:', userId);
}

async function createConversation() {
  const conv = await req('/conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ participantIds: [userId] }),
  });
  conversationId = conv.data._id;
  console.log('✅ Conversation created:', conversationId);
}

async function chatFlow() {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET, {
      auth: { token },
      transports: ['websocket'],
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Socket timeout'));
    }, 10000);

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket.emit('join_conversation', conversationId);
    });

    socket.on('receive_message', (msg) => {
      console.log('📨 Received message:', msg.content);
      if (msg.sender !== userId) {
        console.log('✅ Agent/Bot message received');
      }
      clearTimeout(timeout);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    // Send a message after joining
    setTimeout(() => {
      socket.emit('send_message', {
        conversationId,
        content: 'Hello from E2E test',
        type: 'text',
      });
      console.log('📤 Message sent');
    }, 500);
  });
}

async function main() {
  console.log('🧪 ClawChat E2E Smoke Test');
  try {
    await registerAndLogin();
    await createConversation();
    await chatFlow();
    console.log('\n🎉 All E2E checks passed');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E failed:', err.message);
    process.exit(1);
  }
}

main();
