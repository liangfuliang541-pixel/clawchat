# 🦞 ClawChat

> **A Hermès-grade digital messenger.**
>
> Crafted with the precision of a master artisan and the speed of Hermes, the divine messenger.
>
> 以工匠大师的精度、赫尔墨斯神使的速度，打造的数字通讯体验。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)

---

## 🐎 Design Philosophy | 设计理念

ClawChat draws inspiration from two powerful symbols:

- **🦞 The Lobster** — Resilient, distinctive, unmistakably unique. Like a lobster's shell, our architecture is layered and protective.
- **⚡ Hermes** — The Greek god of messengers, trade, and thieves. Swift, reliable, and ever-delivering. Every message is a sacred dispatch.

> _"Type-safe by design, crafted with care."_

---

## 🚀 Quick Start | 快速开始

### Prerequisites | 环境要求

- Node.js >= 20
- Docker (optional | 可选)

### One-Command Deploy | 一键部署

```bash
# Production | 生产环境
./deploy.sh        # Linux / macOS
deploy.bat         # Windows
```

### Local Development | 本地开发

```bash
# Install dependencies | 安装依赖
npm install

# Build shared types | 构建共享类型
npm run build -w shared

# Start all services | 启动所有服务
npm run dev
```

- Frontend | 前端: http://localhost:5173
- Backend API | 后端 API: http://localhost:3001/api
- Health Check | 健康检查: http://localhost:3001/health

### Zero-Dependency Mode | 零依赖模式

No MongoDB? No problem. Set `USE_MOCK_DB=true` in `.env` to run with in-memory database.
<br>没有 MongoDB？没问题。在 `.env` 中设置 `USE_MOCK_DB=true` 即可使用内存数据库运行。

---

## 📁 Project Structure | 项目结构

```
clawchat/
├── frontend/                # React + Vite + Tailwind + Zustand
├── backend/                 # Express + TypeScript + Mongoose + Socket.io
├── shared/                  # Shared TypeScript types & DTOs | 共享类型
├── nginx/                   # Reverse proxy config | 反向代理配置
├── docs/                    # Architecture & design docs | 架构与设计文档
├── docker-compose.yml       # Local infra (MongoDB + Redis)
├── docker-compose.prod.yml  # Production orchestration | 生产编排
├── deploy.sh / deploy.bat   # One-click deploy scripts | 一键部署脚本
└── .env.example             # Environment template | 环境变量模板
```

---

## 🛠 Tech Stack | 技术栈

| Layer    | 层级   | Technologies                                                         |
| -------- | ------ | -------------------------------------------------------------------- |
| Frontend | 前端   | React 18, TypeScript, Vite, Tailwind CSS v3, Zustand, TanStack Query |
| Backend  | 后端   | Express.js, TypeScript, Mongoose, Socket.io, Zod, Pino, Redis        |
| AI Agent | 智能体 | Hermes Agent (Nous Research) bridge — OpenAI-compatible API          |
| Database | 数据库 | MongoDB (with MockDB fallback)                                       |
| DevOps   | 运维   | Docker, Docker Compose, Nginx                                        |
| Testing  | 测试   | Vitest                                                               |

---

## 🤖 Agent Collaboration | 智能体协作

This project is built collaboratively by AI agents. See [`AGENTS.md`](./AGENTS.md) for the collaboration contract.
<br>本项目由 AI 智能体协作构建。详见 [`AGENTS.md`](./AGENTS.md) 了解协作契约。

---

## 📜 License | 许可证

MIT
