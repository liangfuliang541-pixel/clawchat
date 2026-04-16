# ClawChat - 项目规划文档

## 项目概述
ClawChat 是一个现代化的即时通讯应用，具有实时消息、用户认证、群组功能等特性。

## 核心功能
- ✅ 用户认证与注册
- ✅ 一对一私聊
- ✅ 群组管理与群聊
- ✅ 实时消息同步
- ✅ 用户在线状态
- ✅ 消息已读状态
- ✅ 文件分享
- ✅ 用户头像与个人信息

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design / Material-UI
- **实时通信**: Socket.io / WebSocket
- **状态管理**: Redux Toolkit / Zustand
- **打包工具**: Vite

### 后端
- **运行环境**: Node.js
- **框架**: Express.js / Fastify
- **数据库**: MongoDB / PostgreSQL
- **认证**: JWT + Bcrypt
- **实时通信**: Socket.io
- **文件存储**: Cloudinary / AWS S3

### 开发工具
- **版本控制**: Git
- **包管理**: npm / yarn
- **构建**: Webpack / Vite
- **测试**: Jest / Vitest
- **代码规范**: ESLint + Prettier

## 项目结构
```
clawchat/
├── frontend/              # React前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── backend/               # Node.js后端应用
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── config/
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
└── README.md
```

## 开发阶段
### Phase 1: 基础架构 (第1周)
- [ ] 创建前端基础项目
- [ ] 创建后端基础项目
- [ ] 数据库设计
- [ ] API设计文档

### Phase 2: 核心功能 (第2-3周)
- [ ] 用户认证系统
- [ ] 消息功能
- [ ] 实时通信

### Phase 3: 扩展功能 (第4周)
- [ ] 群组功能
- [ ] 文件分享
- [ ] 用户状态

### Phase 4: 优化与部署 (第5周)
- [ ] 性能优化
- [ ] 安全加固
- [ ] 生产部署

## 数据模型

### User (用户)
```
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  status: 'online' | 'offline' | 'away',
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
  content: String,
  type: 'text' | 'image' | 'file' | 'video',
  fileUrl: String (optional),
  isRead: Boolean,
  createdAt: Date
}
```

### Conversation (对话)
```
{
  _id: ObjectId,
  participants: [ObjectId],
  type: 'private' | 'group',
  name: String,
  lastMessage: ObjectId,
  updatedAt: Date
}
```

### Group (群组)
```
{
  _id: ObjectId,
  name: String,
  avatar: String,
  description: String,
  admin: ObjectId,
  members: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## API端点设计

### 认证
- POST /auth/register - 注册
- POST /auth/login - 登录
- POST /auth/logout - 登出
- GET /auth/profile - 获取个人信息

### 消息
- GET /messages/:conversationId - 获取消息列表
- POST /messages - 发送消息
- PUT /messages/:messageId - 标记为已读
- DELETE /messages/:messageId - 删除消息

### 对话
- GET /conversations - 获取对话列表
- POST /conversations - 创建对话
- DELETE /conversations/:conversationId - 删除对话

### 用户
- GET /users/:userId - 获取用户信息
- PUT /users/:userId - 更新用户信息
- GET /users/search/:keyword - 搜索用户

### 群组
- GET /groups - 获取群组列表
- POST /groups - 创建群组
- PUT /groups/:groupId - 更新群组
- POST /groups/:groupId/members - 添加成员
- DELETE /groups/:groupId/members/:memberId - 移除成员

## Socket.IO 事件

### 客户端发送
- `send_message` - 发送消息
- `typing` - 正在输入
- `read_message` - 消息已读
- `user_online` - 用户上线
- `user_offline` - 用户离线

### 服务器广播
- `receive_message` - 接收消息
- `user_typing` - 用户正在输入
- `user_status_changed` - 用户状态改变
- `message_read` - 消息被标记为已读

## 下一步
请选择要先开始实现哪个部分：
1. 前端项目初始化
2. 后端项目初始化
3. 数据库架构设计
4. API文档详细设计
