# ClawChat

一个基于 React + Node.js 的实时聊天应用，支持单聊、群聊和外部 AI Agent 接入。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-19%20passing-brightgreen?logo=vitest)](https://vitest.dev/)

---

## 快速开始

### 环境要求

- Node.js >= 20
- Docker（可选，用于本地 MongoDB + Redis）

### 本地开发

```bash
# 安装依赖
npm install

# 构建共享类型
npm run build -w shared

# 启动所有服务
npm run dev
```

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001/api
- 健康检查: http://localhost:3001/health

没有 MongoDB 也能跑。在 `.env` 里设置 `USE_MOCK_DB=true` 就会切换成内存数据库，方便本地调试。

### 生产部署

```bash
# Linux / macOS
./deploy.sh

# Windows
 deploy.bat

# 验证
curl http://localhost:3001/health
```

---

## 项目结构

```
clawchat/
├── frontend/                # React + Vite + Tailwind CSS
├── backend/                 # Express + TypeScript + Mongoose + Socket.io
├── shared/                  # 共享 TypeScript 类型
├── nginx/                   # 反向代理配置
├── docs/                    # 架构与设计文档
├── docker-compose.yml       # 本地基础设施 (MongoDB + Redis)
├── docker-compose.prod.yml  # 生产编排
├── deploy.sh / deploy.bat   # 部署脚本
└── .env.example             # 环境变量模板
```

---

## 技术栈

| 层级     | 技术                                                                 |
| -------- | -------------------------------------------------------------------- |
| 前端     | React 18, TypeScript, Vite, Tailwind CSS v3, Zustand, TanStack Query |
| 后端     | Express.js, TypeScript, Mongoose, Socket.io, Zod, Pino, Redis        |
| AI Agent | Hermes Agent (Nous Research) bridge，OpenAI-compatible API           |
| 数据库   | MongoDB（支持 MockDB 内存回退）                                      |
| 部署     | Docker, Docker Compose, Nginx                                        |
| 测试     | Vitest                                                               |

---

## 主要功能

- 实时一对一与群聊（Socket.io）
- JWT 用户认证 + X-API-Key Agent 认证
- 外部 AI Agent 接入：注册 Agent、通过 API Key 发消息、`@agent` 提及自动触发
- AgentManager 前端面板，管理 Hermes Agent 配置
- 完整的 Repository/Service/Controller 分层架构
- MockDB 零依赖开发模式
- Docker 一键生产部署

---

## Agent 接入示例

注册用户级别的 Agent（需要登录）：

```bash
curl -X POST http://localhost:3001/api/agents/register \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"MyBot","agentType":"custom"}'
```

用 API Key 以 Agent 身份发消息：

```bash
curl -X POST http://localhost:3001/api/agents/message \
  -H "X-API-Key: <apiKey>" \
  -d '{"conversationId":"...","content":"Hello"}'
```

接入 Hermes Agent 实例：

```bash
curl -X POST http://localhost:3001/api/hermes/register \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Hermes","baseUrl":"http://localhost:8080/v1","apiKey":"sk-...","autoReply":true}'
```

---

## License

MIT
