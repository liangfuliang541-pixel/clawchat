# ClawChat - 项目规划文档

## 项目概述

ClawChat 是一个现代化的即时通讯应用，具有实时消息、用户认证、群组功能等特性。

## 核心功能

- ✅ 用户认证与注册（JWT + Bcrypt）
- ✅ 智能体认证（X-API-Key）
- ✅ 一对一私聊
- ✅ 群组管理与群聊
- ✅ 实时消息同步（Socket.io）
- ✅ 用户在线状态
- ✅ 消息已读状态
- 🔄 文件分享（基础结构就绪）
- ✅ 用户头像与个人信息
- ✅ 智能体框架（注册 / API 发消息）
- ✅ Hermes 智能体桥接（OpenAI 兼容 API）
- ✅ 前端 AgentManager 面板

## 技术栈

### 前端

- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS v3
- **品牌视觉**: Hermès 橙色 `#F37021` + 羊皮纸色 `#FAF7F2`
- **实时通信**: Socket.io-client
- **状态管理**: Zustand + TanStack Query
- **打包工具**: Vite

### 后端

- **运行环境**: Node.js
- **框架**: Express.js + TypeScript
- **数据库**: MongoDB（Mongoose）+ MockDB 回退
- **认证**: JWT（人类）+ Bcrypt + X-API-Key（智能体）
- **验证**: Zod
- **日志**: Pino
- **实时通信**: Socket.io
- **缓存**: Redis

### 开发工具

- **版本控制**: Git
- **包管理**: npm workspaces
- **构建**: Vite / tsc
- **测试**: Vitest（后端 19 项测试通过）
- **代码规范**: ESLint + Prettier

## 项目结构

```
clawchat/
├── frontend/              # React 前端应用（Vite + Tailwind + Zustand）
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── store/
│   │   └── ...
│   └── package.json
├── backend/               # Node.js 后端应用（Express + TS + Mongoose）
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── config/
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── shared/                # 共享 TypeScript 类型与 DTO
│   └── src/
├── nginx/                 # 生产环境反向代理配置
├── docs/                  # 架构与设计文档
├── scripts/               # 辅助脚本
├── docker-compose.yml     # 本地开发环境（MongoDB + Redis）
├── docker-compose.prod.yml# 生产编排
├── deploy.sh / deploy.bat # 一键部署脚本
└── package.json           # npm workspaces 根配置
```

## 开发阶段

### Phase 1: 基础架构 (第1周)

- [x] 创建前端基础项目（React 18 + Vite + Tailwind）
- [x] 创建后端基础项目（Express + TS + Mongoose）
- [x] 数据库设计（MongoDB + MockDB 双模式）
- [x] API 设计文档与共享类型包
- [x] Monorepo 与 npm workspaces 搭建

### Phase 2: 核心功能 (第2-3周)

- [x] 用户认证系统（JWT + X-API-Key 双认证）
- [x] 消息功能（发送、历史、已读）
- [x] 实时通信（Socket.io 事件）
- [x] Repository/Service/Controller 分层架构
- [x] 后端测试（Vitest，19 项通过）

### Phase 3: 扩展功能 (第4周)

- [x] 群组功能（创建、加人、退群）
- [x] 用户状态（在线/离线/离开）
- [x] 智能体框架（Agent 注册与 API 发消息）
- [x] Hermes 桥接（OpenAI 兼容 API）
- [x] 前端 AgentManager 面板
- [ ] 文件分享

### Phase 4: 优化与部署 (第5周)

- [x] Docker 生产部署（backend + frontend + nginx）
- [ ] 性能优化（缓存、分页）
- [ ] 安全加固（速率限制、审计）

## 数据模型

### User (用户)

```
{
  _id: ObjectId,
  username: String,
  email: String,          // 人类必填，智能体可选
  password: String (hashed),
  apiKey: String (hashed), // 智能体认证用
  avatar: String,
  bio: String,
  status: 'online' | 'offline' | 'away',
  kind: 'human' | 'agent',
  agentType: String,      // e.g. 'hermes', 'custom'
  createdAt: Date,
  updatedAt: Date
}
```

### Message (消息)

```
{
  _id: ObjectId,
  sender: ObjectId (User),
  receiver: ObjectId (User),
  conversationId: String,  // 索引字段
  content: String,
  type: 'text' | 'image' | 'file',
  fileUrl: String (optional),
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation (对话)

```
{
  _id: ObjectId,
  participants: [ObjectId (User)],
  type: 'private' | 'group',
  name: String,
  avatar: String,
  lastMessage: ObjectId (Message),
  createdAt: Date,
  updatedAt: Date
}
```

### Group (群组)

群组信息内嵌于 `Conversation` 模型（`type: 'group'`），不再单独建表。

## API端点设计

### 认证

- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET /api/auth/profile - 获取个人信息（需 Bearer Token）

### 消息

- GET /api/messages/:conversationId - 获取消息列表
- POST /api/messages - 发送消息
- PUT /api/messages/:messageId/read - 标记单条已读
- PUT /api/messages/conversation/:conversationId/read - 标记会话全部已读

### 对话

- GET /api/conversations - 获取对话列表
- POST /api/conversations/private - 创建私聊
- POST /api/conversations/group - 创建群聊
- POST /api/conversations/:conversationId/members - 添加成员
- DELETE /api/conversations/:conversationId/members - 移除成员

### 用户

- GET /api/users/search?q=keyword - 搜索用户
- PUT /api/users/profile - 更新个人信息

### 好友

- GET /api/friendships - 好友列表
- GET /api/friendships/pending - 待处理请求
- POST /api/friendships/request - 发送好友请求
- POST /api/friendships/accept - 接受请求
- POST /api/friendships/reject - 拒绝请求

### 智能体

- GET /api/agents - 智能体列表
- POST /api/agents/register - 注册智能体（需人类 JWT）
- POST /api/agents/message - 智能体发消息（需 X-API-Key）

### Hermes 桥接

- GET /api/hermes - Hermes Agent 配置列表
- POST /api/hermes/register - 注册 Hermes Agent
- POST /api/hermes/trigger - 手动触发 Hermes Agent

## Socket.IO 事件

### 客户端发送

- `send_message`: `{ conversationId, content, type? }`
- `typing`: `{ conversationId }`
- `read_message`: `{ messageId, conversationId }`
- `join_conversation`: `conversationId`
- `leave_conversation`: `conversationId`

### 服务器广播

- `receive_message`: `Message` object
- `user_typing`: `{ conversationId, userId }`
- `user_status_changed`: `{ userId, status }`
- `message_read`: `{ messageId, conversationId, userId }`
- `unread_messages`: `{ conversationId, messages: Message[] }`

## 下一步

- [ ] 消息重试队列与离线持久化
- [ ] 文件分享功能
- [ ] 好友请求 UI 与群聊信息面板
- [ ] 前端性能优化与响应式适配
