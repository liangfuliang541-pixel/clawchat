# ClawChat

🦞 **A Hermès-grade real-time chat application** — Built with React + Node.js, supporting 1-on-1 chat, group chat, and external AI Agent integration.

[简体中文](./README.md) | **English**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express-5-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?logo=socket.io)](https://socket.io/)
[![Tests](https://img.shields.io/badge/Tests-19%20passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **Docker** (optional, for local MongoDB + Redis)

### Local Development

```bash
# Clone and install dependencies
git clone https://github.com/yourusername/clawchat.git
cd clawchat
npm install

# Build shared types
npm run build -w shared

# Start all services (frontend + backend)
npm run dev
```

**Endpoints:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

### Without MongoDB

No MongoDB? No problem. Set `USE_MOCK_DB=true` in your `.env` file, and the app will use in-memory database for local development.

```bash
# Create .env from template
cp .env.example .env
echo "USE_MOCK_DB=true" >> .env

npm run dev
```

### Production Deployment

```bash
# Linux / macOS
./deploy.sh

# Windows
deploy.bat

# Verify
curl http://localhost:3001/health
```

---

## 📁 Project Structure

```
clawchat/
├── frontend/                     # React 18 + Vite + Tailwind CSS
├── backend/                      # Express + TypeScript + Socket.io
├── shared/                       # Shared TypeScript types & utilities
├── nginx/                        # Reverse proxy configuration
├── docs/                         # Architecture & design documentation
│   ├── zh-CN/                    # Simplified Chinese
│   └── en-US/                    # English
├── docker-compose.yml            # Local infrastructure (MongoDB + Redis)
├── docker-compose.prod.yml       # Production orchestration
├── deploy.sh / deploy.bat        # Deployment scripts
└── .env.example                  # Environment variables template
```

---

## 🛠️ Technology Stack

| Layer            | Technology                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Frontend**     | React 18, TypeScript, Vite, Tailwind CSS v3, Zustand (state), Socket.IO Client                     |
| **Backend**      | Express.js, TypeScript, Mongoose (MongoDB ODM), Socket.IO Server, Zod (validation), Pino (logging) |
| **AI Agent**     | Hermes Agent (Nous Research) bridge — OpenAI-compatible API integration                            |
| **Database**     | MongoDB (with MockDB in-memory fallback for development)                                           |
| **Deployment**   | Docker, Docker Compose, Nginx reverse proxy                                                        |
| **Testing**      | Vitest framework, 19+ passing tests                                                                |
| **Code Quality** | Prettier, ESLint, Husky (pre-commit hooks), lint-staged                                            |

---

## 🤖 AI Agent Framework

ClawChat includes a **production-ready AI Agent integration layer** built for extensibility:

### Key Features

- **Hermes Bridge Service** — Seamlessly connect external Hermes agents (Nous Research)
- **Agent Registry** — Register multiple agents, manage via UI panel
- **OpenAI-Compatible API** — Support any `/v1/chat/completions` compatible backend
- **Auto-Reply** — Enable agents to automatically respond to messages
- **Conversation History** — Automatic chat history formatting for agents
- **Real-time Integration** — Socket.IO events for live agent responses

### Quick Agent Setup

```typescript
// Register a Hermes agent
POST /api/hermes/register
{
  "name": "HermesAgent",
  "baseUrl": "https://agent-api.example.com",
  "apiKey": "secret-key",
  "model": "hermes-agent",
  "enabled": true,
  "autoReply": true,
  "systemPrompt": "You are a helpful assistant."
}

// Trigger agent in chat
Send message: "@HermesAgent What's the weather?"
```

See [AGENTS.md](./AGENTS_EN.md) for complete Agent Framework documentation.

---

## 📊 Feature Overview

### ✅ v0.2.0 Release Highlights

| Feature               | Status      | Details                                   |
| --------------------- | ----------- | ----------------------------------------- |
| **1-on-1 Chat**       | ✅ Complete | Real-time messaging with Socket.IO        |
| **Group Chat**        | ✅ Complete | Multi-user conversations                  |
| **Friend System**     | ✅ Complete | Add/remove friends, friendship management |
| **AI Agents**         | ✅ Complete | Hermes agent integration, auto-reply      |
| **Agent Manager UI**  | ✅ Complete | Register & manage agents in sidebar       |
| **Authentication**    | ✅ Complete | JWT token-based with bcrypt hashing       |
| **3-Column Layout**   | ✅ Complete | Sidebar + ChatArea + Agent Panel          |
| **Docker Deployment** | ✅ Complete | One-command production deploy             |
| **MockDB Support**    | ✅ Complete | In-memory DB for local development        |
| **TypeScript Strict** | ✅ Complete | 100% type-safe codebase                   |
| **Test Coverage**     | ✅ Complete | 19+ passing integration tests             |

---

## 📚 Documentation

### For Contributors

- **[CONTRIBUTING.md](./CONTRIBUTING_EN.md)** — How to contribute code, bug reports, feature requests
- **[DEVELOPMENT_STANDARDS.md](./docs/en-US/DEVELOPMENT_STANDARDS.md)** — Code style, commit conventions, PR process

### For Architects

- **[ARCHITECTURE.md](./docs/en-US/ARCHITECTURE.md)** — System design, layering, scalability patterns
- **[ARCHITECTURE_SUMMARY.md](./docs/en-US/ARCHITECTURE_SUMMARY.md)** — Quick overview of architecture highlights

### For Deployers

- **[DEPLOYMENT_GUIDE.md](./docs/en-US/DEPLOYMENT_GUIDE.md)** — Docker, Kubernetes, CI/CD, monitoring
- **[API_AND_MODELS.md](./docs/en-US/API_AND_MODELS.md)** — Complete API reference, data models, WebSocket events

### For Product Managers

- **[PROJECT_PLAN.md](./docs/en-US/PROJECT_PLAN.md)** — Feature roadmap, release timeline, milestone tracking

---

## 🎨 Design System

ClawChat uses a **Hermès-inspired design language** — fusing the lobster's resilience with Hermes' divine reliability:

### Color Palette

- **Primary**: Hermès Orange `#F37021`
- **Accent**: Saddle Brown `#2C1810`
- **Gold**: `#C9A961`
- **Background**: Cream Parchment `#FAF7F2`

### Design Principles

- **Tactile Feedback** — Every interaction feels weighted and deliberate
- **Clarity** — Minimal but expressive UI
- **Performance** — Smooth animations, instant feedback

---

## 🔒 Security

- **JWT Authentication** — Secure token-based auth with 7-day expiry
- **Password Hashing** — bcryptjs with 10-round salt
- **Environment Secrets** — Never commit `.env` — use `.env.example`
- **CORS Enabled** — Frontend-backend communication secured
- **Socket.IO Auth** — JWT verification on real-time connections

---

## 📈 Performance

- **Socket.IO Optimized** — Real-time message sync at sub-100ms latency
- **Lazy Loading** — Frontend code-split by route
- **Message Pagination** — Load chat history in 50-message chunks
- **MongoDB Indexing** — Optimized queries for conversations, messages, users
- **Docker Multi-Stage Build** — Minimal production image size

---

## 🤝 Community & Contributing

We welcome contributions! 🙏

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING_EN.md) for detailed guidelines.

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) file for details.

---

## 🙌 Acknowledgments

- **Socket.IO** — Real-time communication
- **Hermes Agent** — AI integration framework
- **Hermès** — Design inspiration (brand, aesthetics, reliability)
- **Open Source Community** — All developers who contributed insights and code

---

## 📞 Support

- **Issues** — Report bugs via [GitHub Issues](https://github.com/yourusername/clawchat/issues)
- **Discussions** — Ask questions in [GitHub Discussions](https://github.com/yourusername/clawchat/discussions)
- **Email** — Contact: support@clawchat.dev

---

## 🚀 Roadmap

### v0.3.0 (Q2 2026)

- Group chat moderation
- Agent voting system (multiple agents respond, users vote on best)
- Rich message formatting (markdown, code blocks, media)
- Message search & filtering

### v0.4.0 (Q3 2026)

- Voice messages
- End-to-end encryption (E2EE)
- Telegram/Slack bridge integration
- Custom agent templates

### v1.0.0 (Q4 2026)

- Mobile app (React Native)
- Self-hosted vs Cloud options
- Enterprise SSO (SAML 2.0, OAuth 2.0)
- Analytics dashboard

---

**Made with 🦞 and ❤️ by the ClawChat Team**

⭐ **Like this project?** Star us on GitHub! Your support keeps us going.
