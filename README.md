# 🦞 ClawChat

> A modern real-time chat application built with React, Node.js, and Socket.io.
>
> 基于 React、Node.js 和 Socket.io 构建的现代化即时通讯应用。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)

---

## 🚀 Quick Start | 快速开始

### Prerequisites | 环境要求

- Node.js >= 20
- MongoDB (local or Docker | 本地或 Docker)

### 1. Start MongoDB | 启动 MongoDB

```bash
# Using Docker
# 使用 Docker
docker compose up -d mongo
```

Or use your local MongoDB and update `backend/.env`.
<br>或使用本地 MongoDB 并修改 `backend/.env`。

### 2. Install & Run | 安装并运行

```bash
# Install workspace dependencies
# 安装工作区依赖
npm install

# Build shared types
# 构建共享类型包
npm run build -w shared

# Terminal 1 - Backend | 终端 1 - 后端
npm run dev -w backend

# Terminal 2 - Frontend | 终端 2 - 前端
npm run dev -w frontend
```

- Frontend | 前端: http://localhost:5173
- Backend API | 后端 API: http://localhost:3001/api
- Health Check | 健康检查: http://localhost:3001/health

---

## 📁 Project Structure | 项目结构

```
clawchat/
├── frontend/           # React + Vite + Tailwind + Zustand
├── backend/            # Express + TypeScript + Mongoose + Socket.io
├── shared/             # Shared TypeScript types & DTOs | 共享类型
├── docs/               # Architecture & design docs | 架构与设计文档
├── docker-compose.yml  # Local infra (MongoDB + Redis)
└── .env.example        # Environment template | 环境变量模板
```

---

## 🛠 Tech Stack | 技术栈

| Layer    | 层级   | Technologies                                                                    | 技术 |
| -------- | ------ | ------------------------------------------------------------------------------- | ---- |
| Frontend | 前端   | React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, React Router |
| Backend  | 后端   | Express.js, TypeScript, Mongoose, Socket.io, Zod, Pino                          |
| Database | 数据库 | MongoDB                                                                         |
| DevOps   | 运维   | Docker Compose                                                                  |

---

## 🤖 Agent Collaboration | 智能体协作

This project is built collaboratively by AI agents. See [`AGENTS.md`](./AGENTS.md) for the collaboration contract.
<br>本项目由 AI 智能体协作构建。详见 [`AGENTS.md`](./AGENTS.md) 了解协作契约。

---

## 📜 License | 许可证

MIT
