# 🤖 ClawChat - Agent Collaboration Contract | 智能体协作契约

## Current Status | 当前状态

- ✅ MVP Phase 1 completed | MVP 第一阶段已完成
- ✅ Auth API validated | 认证 API 已验证通过
- ✅ Frontend Login + Chat pages ready | 前端登录/聊天页面就绪
- 🔄 Phase 2: Message & Conversation APIs in progress | 第二阶段：消息与对话 API 进行中

---

## Roles | 角色分工

### 🎨 VS Code Agent (UI/UX Lead | 前端设计主导)

**Scope | 负责范围:**

- Design and implement `frontend/src/pages/*` | 设计并实现页面
- Design and implement `frontend/src/components/*` | 设计并实现组件
- Visual styling, themes, responsive layout | 视觉样式、主题、响应式布局
- Static assets optimization | 静态资源优化

**Do NOT touch | 禁止触碰:**

- `backend/src/*` | 后端代码
- `shared/src/index.ts` (request changes via discussion | 通过讨论提出变更)
- Root workspace configuration | 根工作区配置

---

### ⚙️ Kimi CLI (Backend & Infra Lead | 后端与基础设施主导)

**Scope | 负责范围:**

- Implement `backend/src/*` | 实现后端代码
- Maintain `shared/src/index.ts` | 维护共享类型
- Database, Docker, deployment configs | 数据库、Docker、部署配置
- Frontend base engineering (api client, router, store setup) | 前端基础工程（API 客户端、路由、状态管理）
- End-to-end integration testing | 端到端联调与测试

**Do NOT touch | 禁止触碰:**

- `frontend/src/pages/*` concrete UI implementations | 页面具体 UI 实现
- `frontend/src/components/*` styling details | 组件样式细节

---

## Communication Protocol | 通信协议

1. **Territory Rule | 领地规则**: If you need to modify the other's scope, discuss first. No silent overwrites.
   <br>如需修改对方领地，先讨论。禁止静默覆盖。
2. **API Contract | API 契约**: Backend exposes `/api/*` REST + Socket.io. Frontend calls via `frontend/src/lib/api.ts`.
   <br>后端提供 `/api/*` REST + Socket.io。前端通过 `frontend/src/lib/api.ts` 调用。
3. **Type Sync | 类型同步**: Changes to `shared/src/index.ts` must be announced immediately.
   <br>修改 `shared/src/index.ts` 必须立即通知对方。
4. **Progress Log | 进度日志**: Update this section after each session.
   <br>每次会话后在此更新进度。

---

## Current API Contract (MVP) | 当前 API 契约

### REST

- `POST /api/auth/register` → `{ user, token }`
- `POST /api/auth/login` → `{ user, token }`
- `GET  /api/auth/profile` → `{ user }` (Bearer Token required | 需携带 Token)
- `GET  /health` → `{ status: 'ok' }`

### Socket.io Events

**Client → Server | 客户端发送:**

- `send_message`: `{ conversationId, content, type? }`
- `typing`: `{ conversationId }`
- `join_conversation`: `conversationId`
- `leave_conversation`: `conversationId`

**Server → Client | 服务端广播:**

- `receive_message`: `Message` object
- `user_typing`: `{ conversationId, userId }`
- `user_status_changed`: `{ userId, status }`

---

## Progress Log | 进度日志

**2026-04-16 - Kimi CLI**

- Initialized monorepo (npm workspaces) | 初始化 Monorepo
- Built backend skeleton (Express + TS + Mongoose + Socket.io) | 搭建后端骨架
- Created shared types package | 创建共享类型包
- Set up frontend base (Vite + Tailwind + Router + Zustand) | 配置前端基础工程
- Fixed JWT ESM loading bug & verified auth APIs | 修复 JWT 加载 bug 并验证认证 API

**2026-04-16 - VS Code Agent**

- Designed LoginPage with auth form & error handling | 设计登录页
- Designed ChatPage with Socket.io integration | 设计聊天页并接入 Socket.io

**Next | 下一步:**

- Kimi CLI: Implement message/conversation APIs & Socket persistence | 实现消息/对话 API 及 Socket 持久化
- VS Code Agent: Polish UI interactions & responsive layout | 优化 UI 交互与响应式布局
