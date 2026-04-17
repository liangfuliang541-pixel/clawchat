# 🤖 ClawChat - Agent Framework & Integration Guide

**Agent Collaboration Contract | Hermes Bridge Architecture**

[简体中文](./AGENTS.md) | **English**

---

## 🦞 Brand Identity

> **ClawChat — A Hermès-grade digital messenger.**

Our design philosophy merges the lobster's distinctive resilience with Hermes' divine messenger reliability:

| Element           | Value                     | Meaning                                |
| ----------------- | ------------------------- | -------------------------------------- |
| **Primary Color** | Hermès Orange `#F37021`   | Energy, craftsmanship, distinctiveness |
| **Accent Color**  | Saddle Brown `#2C1810`    | Sophistication, durability             |
| **Highlight**     | Gold `#C9A961`            | Premium quality, elegance              |
| **Background**    | Cream Parchment `#FAF7F2` | Refined, clean, readable               |

### Interaction Design

- **Tactile Feedback** — Every button press feels weighted and intentional
- **Subtle Animations** — Smooth transitions, no jarring jumps
- **Message Status** — sending → sent → delivered → read
- **Layered Architecture** — Like a lobster's shell, protective yet elegant

---

## 📊 Current Status

### ✅ Version 0.2.0 - Agent Framework Complete

| Component                | Status      | Details                               |
| ------------------------ | ----------- | ------------------------------------- |
| MVP Phase 1              | ✅ Complete | Core chat, auth, friend system        |
| API Validation           | ✅ Complete | All endpoints tested                  |
| 3-Column IM Layout       | ✅ Complete | Sidebar + ChatArea + Agent Panel      |
| Repository/Service Layer | ✅ Complete | Full abstraction with MockDB fallback |
| Docker Production        | ✅ Complete | One-command deploy ready              |
| TypeScript Strict Mode   | ✅ Complete | 100% type-safe, zero errors           |
| **Agent Framework**      | ✅ **NEW**  | Hermes bridge, OpenAI-compatible API  |
| **Hermes Integration**   | ✅ **NEW**  | Real-time agent responses             |
| **AgentManager UI**      | ✅ **NEW**  | Register & manage agents in sidebar   |
| **Test Coverage**        | ✅ Complete | 19+ integration tests passing         |

### 🔄 Phase 3 (In Progress)

- Friend system UI polish
- Group chat enhancements
- Agent voting system
- Message search & filtering

---

## 🏗️ Agent Framework Architecture

### System Layers

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│    AgentManager UI Panel • ConversationSidebar     │
└────────────────────┬────────────────────────────────┘
                     │ Socket.IO
┌────────────────────▼────────────────────────────────┐
│              Socket.IO Event Handler                │
│      maybeTriggerHermesAgent() • Real-time         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            HermesBridgeService (Core)              │
│  • register() — Add new agent                      │
│  • invoke() — Call agent API                       │
│  • getAgents() — List enabled agents               │
│  • buildHistory() — Format conversation            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Repository Layer                      │
│  HermesConfigRepository • UserRepository            │
│  (MongoDB Persistence + MockDB Fallback)           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│        External Hermes Agent API                   │
│    OpenAI-compatible /v1/chat/completions          │
└─────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **HermesBridgeService** (183 lines)

Core service that manages agent lifecycle and API invocation.

```typescript
class HermesBridgeService {
  async loadFromDB(): Promise<void>; // Load agents from MongoDB
  async register(config): Promise<void>; // Register new agent
  async unregister(id): Promise<void>; // Unregister agent
  getAgents(): HermesAgentConfig[]; // List all enabled agents
  async invoke(agentId, conversationId, history): Promise<string>; // Call agent API
  static buildHistory(messages, userId, agentId): ChatMessage[]; // Format conversation
}
```

#### 2. **HermesConfig Model** (65+ lines)

MongoDB schema for agent configuration persistence.

```typescript
interface IHermesConfigDoc {
  name: string; // Unique agent name
  baseUrl: string; // Agent API endpoint
  apiKey: string; // API authentication token
  agentModel?: string; // Model identifier (default: 'hermes-agent')
  enabled: boolean; // Agent active status
  autoReply?: boolean; // Auto-respond to messages
  systemPrompt?: string; // System instructions for agent
  createdAt: Date; // Timestamp
  updatedAt: Date; // Timestamp
}
```

#### 3. **HermesConfigRepository** (57 lines)

Repository pattern for CRUD operations with MockDB fallback.

```typescript
class HermesConfigRepository {
  async findByName(name: string); // Find agent by name
  async findEnabled(); // Get all enabled agents
  async upsertByName(data); // Create or update agent
  async deleteByName(name: string); // Remove agent
}
```

#### 4. **Socket.IO Integration**

Real-time agent trigger mechanism.

```typescript
async function maybeTriggerHermesAgent(io, conversationId, senderUserId) {
  // 1. Get all enabled agents
  // 2. Check if message contains @agent trigger or autoReply enabled
  // 3. Create virtual agent user if not exists
  // 4. Format conversation history
  // 5. Invoke agent API via HermesBridgeService
  // 6. Broadcast agent response back to clients
}
```

---

## 🚀 Integration Flow

### Message → Agent → Response

```
User sends message in chat
    ↓
Socket.IO receives "send_message" event
    ↓
Check: Does message contain "@agent" or "autoReply" enabled?
    ↓ [NO] → Broadcast to normal users only
    ↓ [YES]
Get all enabled Hermes agents
    ↓
For each matched agent:
    • Find or create virtual agent user (kind: 'agent')
    • Format conversation history (last 50 messages)
    • Build ChatMessage array with systemPrompt
    ↓
Call agent API: POST /v1/chat/completions
    (OpenAI-compatible format)
    ↓
Get agent response (stream or complete)
    ↓
Save response as Message (from agentUserId)
    ↓
Broadcast to all users via Socket.IO
    ↓
Frontend updates UI (new message appears in chat)
```

---

## 📡 API Endpoints

### Agent Management

#### Register Agent

```http
POST /api/hermes/register
Content-Type: application/json

{
  "name": "HermesAgent",
  "baseUrl": "https://agent-api.example.com",
  "apiKey": "secret-key-12345",
  "model": "hermes-agent",
  "enabled": true,
  "autoReply": true,
  "systemPrompt": "You are a helpful coding assistant. Provide concise answers."
}

Response: 201 Created
{
  "success": true,
  "data": {
    "name": "HermesAgent",
    "baseUrl": "https://agent-api.example.com",
    "model": "hermes-agent",
    "enabled": true,
    "apiKey": "***"  // Hidden for security
  }
}
```

#### List Agents

```http
GET /api/hermes/agents

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "HermesAgent",
      "baseUrl": "https://agent-api.example.com",
      "enabled": true,
      "autoReply": true,
      "apiKey": "***"
    }
  ]
}
```

#### Invoke Agent

```http
POST /api/hermes/invoke
Content-Type: application/json

{
  "agentId": "507f1f77bcf86cd799439011",
  "conversationId": "507f1f77bcf86cd799439012",
  "history": [
    { "role": "user", "content": "What is React?" },
    { "role": "assistant", "content": "React is a JavaScript library for building UIs." }
  ]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "content": "React is a popular JavaScript library created by Facebook for building user interfaces with reusable components."
  }
}
```

---

## 🔌 OpenAI-Compatible API Format

When invoking a registered agent, ClawChat sends requests in OpenAI-compatible format:

```http
POST https://agent-api.example.com/v1/chat/completions
Content-Type: application/json
Authorization: Bearer secret-key-12345

{
  "model": "hermes-agent",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "What is React?"
    },
    {
      "role": "assistant",
      "content": "React is a JavaScript library..."
    },
    {
      "role": "user",
      "content": "@HermesAgent help me optimize this code"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}

Response:
{
  "id": "chatcmpl-9f3d4e2c",
  "object": "chat.completion",
  "created": 1713456789,
  "model": "hermes-agent",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's an optimized version of your code..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

---

## 🛠️ Setting Up Your Own Hermes Agent

### Prerequisites

- Hermes Agent instance running (Nous Research)
- OpenAI-compatible `/v1/chat/completions` endpoint
- API key for authentication

### Step 1: Start Hermes Agent (Local Example)

```bash
# Using Ollama with Hermes model
ollama pull hermes2

# Serve on localhost:11434
ollama serve

# Or use LM Studio, vLLM, or other OpenAI-compatible server
```

### Step 2: Register Agent in ClawChat

```bash
curl -X POST http://localhost:3001/api/hermes/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HermesLocal",
    "baseUrl": "http://localhost:11434",
    "apiKey": "local-dev-key",
    "model": "hermes2",
    "enabled": true,
    "autoReply": false,
    "systemPrompt": "You are a helpful code reviewer. Provide constructive feedback on code."
  }'
```

### Step 3: Trigger Agent in Chat

Open ClawChat UI and send a message:

```
@HermesLocal Review this React component for performance issues

<paste your component code>
```

The agent will automatically respond!

---

## 🧪 Testing Agent Integration

### Unit Tests

```bash
npm run test -- HermesBridgeService.test.ts
```

### Integration Test

```bash
# 1. Start services
npm run dev

# 2. Register test agent
curl -X POST http://localhost:3001/api/hermes/register \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# 3. Send message in frontend UI with @agent trigger
# 4. Verify agent response appears in chat

# 5. Check backend logs
# Expected: "Triggering Hermes Agent response"
# Expected: "Hermes agent registered"
```

### Manual WebSocket Test

```bash
# Use socket.io-client-tool or similar
# Connect to http://localhost:3001
# Subscribe to "message" events
# Send: { type: "send_message", conversationId: "...", content: "@HermesAgent test" }
```

---

## 🔐 Security Considerations

### API Key Management

- ✅ Store `apiKey` in MongoDB (encrypted)
- ✅ Never expose API key in frontend
- ✅ Hide API key in list response (`apiKey: "***"`)
- ✅ Validate API key on each invoke

### Rate Limiting

Consider implementing:

```typescript
// Per-agent rate limit
const AGENT_INVOKE_LIMIT = 10; // 10 requests per minute
const AGENT_INVOKE_WINDOW = 60000; // 1 minute

// Per-user rate limit
const USER_AGENT_LIMIT = 5; // 5 agents per conversation
```

### Timeout Protection

```typescript
const INVOKE_TIMEOUT_MS = 15000; // 15 second timeout
// If agent API doesn't respond, fall back gracefully
```

---

## 🎯 Best Practices

### For Agent Developers

1. **System Prompts** — Craft clear, concise system prompts

   ```
   ✅ Good: "You are a JavaScript expert. Answer questions concisely."
   ❌ Bad: "just respond"
   ```

2. **Response Format** — Support streaming & completion modes

   ```typescript
   // Streaming: Send tokens as they arrive
   // Completion: Send full response at once
   ```

3. **Timeout Handling** — Respect the 15-second timeout
   ```typescript
   // Ensure responses come within timeout window
   ```

### For ClawChat Users

1. **Agent Naming** — Use clear, descriptive names

   ```
   ✅ CodeReviewAgent
   ✅ JavaScriptHelper
   ❌ agent123
   ```

2. **System Prompts** — Define clear instructions

   ```
   "You are a code reviewer. Provide constructive feedback on code quality, performance, and best practices. Be concise."
   ```

3. **Triggering** — Use @agentname or enable autoReply
   ```
   @CodeReviewAgent Review my function
   ```

---

## 🚀 Advanced Configuration

### Multiple Agents in One Conversation

```typescript
// Register multiple agents
POST /api/hermes/register { name: "Agent1", ... }
POST /api/hermes/register { name: "Agent2", ... }

// Trigger in message
"@Agent1 and @Agent2 what do you think about this?"

// Both agents respond, users see parallel responses
```

### Conditional Auto-Reply

```typescript
// Agent only replies if conditions met
{
  "name": "ErrorAgent",
  "autoReply": true,
  "systemPrompt": "Only respond if the message contains error traces or stack dumps."
}
```

### Agent Voting System (v0.3.0)

```
User: "How should I optimize this function?"

Multiple agents respond:
  Agent1 ⬆️ 5 votes (Best answer)
  Agent2 ⬆️ 2 votes
  Agent3 ⬆️ 1 vote

Users can vote on best response
```

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Full system architecture
- **[API_AND_MODELS.md](./docs/API_AND_MODELS.md)** — Complete API reference
- **[Hermes Documentation](https://github.com/NousResearch/Hermes-3)** — Official Hermes docs
- **[OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)** — API compatibility reference

---

## 🤝 Contributing to Agent Framework

We welcome contributions! To add new agent features:

1. Fork the repository
2. Create feature branch: `git checkout -b feat/agent-voting`
3. Implement feature with tests
4. Submit PR with documentation

See [CONTRIBUTING.md](./CONTRIBUTING_EN.md) for guidelines.

---

**Made with 🦞 by ClawChat Team | Powered by Hermes Agent Framework**
