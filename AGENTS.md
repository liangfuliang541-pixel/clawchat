# 🤖 ClawChat - Agent Collaboration Contract | 智能体协作契约

## Brand Identity | 品牌身份

> **🦞 ClawChat — A Hermès-grade digital messenger.**

Our design language fuses the lobster's distinctive resilience with Hermes' divine reliability:

- **Visual | 视觉**: Hermès orange (`#F37021`) + saddle brown (`#2C1810`) + gold accents (`#C9A961`) on cream parchment (`#FAF7F2`)
- **Interaction | 交互**: Tactile feedback, subtle animations, message delivery status (sending → sent → delivered → read)
- **Architecture | 架构**: Layered like a lobster's shell, swift like Hermes' winged sandals — strict Controller → Service → Repository layering

---

## Current Status | 当前状态

- ✅ MVP Phase 1 completed | MVP 第一阶段已完成
- ✅ Auth API validated | 认证 API 已验证通过
- ✅ 3-column IM layout (Sidebar + ChatArea) | 三栏 IM 布局完成
- ✅ Full Repository/Service layer with MockDB fallback | 完整 Repository/Service 层 + MockDB 回退
- ✅ Docker production deployment ready | Docker 生产部署就绪
- ✅ TypeScript strict mode clean | TypeScript 严格模式无错误
- 🔄 Phase 3: Friend system UI + group chat features | 第三阶段：好友系统 UI + 群聊功能

---

## Roles | 角色分工

### 🎨 VS Code Agent (UI/UX Lead | 前端设计主导)

**Scope | 负责范围:**

- Design and implement `frontend/src/pages/*` | 设计并实现页面
- Design and implement `frontend/src/components/*` | 设计并实现组件
- Visual styling, themes, responsive layout | 视觉样式、主题、响应式布局
- Brand identity execution (colors, typography, motion) | 品牌视觉执行

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
- Frontend base engineering (api client, router, store setup) | 前端基础工程
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
5. **Quality Gate | 质量门禁**: No push to `main` until `npm run build` (frontend) + `npx vitest run` (backend) both pass.
   <br>前端 `npm run build` 与后端 `npx vitest run` 全部通过后方可推送至 `main`。

---

## Current API Contract | 当前 API 契约

### REST

- `POST /api/auth/register` → `{ user, token }`
- `POST /api/auth/login` → `{ user, token }`
- `GET  /api/auth/profile` → `{ user }` (Bearer Token required)
- `GET  /api/conversations` → `Conversation[]`
- `POST /api/conversations` → `Conversation`
- `GET  /api/messages/:conversationId` → `{ items: Message[], nextCursor? }`
- `GET  /api/friendships` → `User[]`
- `GET  /api/friendships/pending` → `FriendRequest[]`
- `POST /api/friendships/request` → `{ status }`
- `GET  /health` → `{ status: 'ok' }`

### Socket.io Events

**Client → Server | 客户端发送:**

- `send_message`: `{ conversationId, content, type? }`
- `typing`: `{ conversationId }`
- `read_message`: `{ messageId, conversationId }`
- `join_conversation`: `conversationId`
- `leave_conversation`: `conversationId`

**Server → Client | 服务端广播:**

- `receive_message`: `Message` object
- `user_typing`: `{ conversationId, userId }`
- `user_status_changed`: `{ userId, status }`
- `message_read`: `{ messageId, conversationId, userId }`
- `unread_messages`: `{ conversationId, messages: Message[] }`

---

## Progress Log | 进度日志

**2026-04-16 - Kimi CLI**

- Initialized monorepo (npm workspaces) | 初始化 Monorepo
- Built backend skeleton (Express + TS + Mongoose + Socket.io) | 搭建后端骨架
- Created shared types package | 创建共享类型包
- Set up frontend base (Vite + Tailwind + Router + Zustand) | 配置前端基础工程
- Fixed JWT ESM loading bug & verified auth APIs | 修复 JWT 加载 bug 并验证认证 API
- Implemented Repository/Service layer (Auth/Message/Conversation/Friendship) | 实现 Repository/Service 层
- Full MockDB fallback for zero-dependency dev | MockDB 全覆盖零依赖开发
- Docker production deployment (Dockerfile + nginx + compose) | Docker 生产部署
- Backend TypeScript strict mode clean | 后端 TS 严格模式清理

**2026-04-16 - VS Code Agent**

- Designed LoginPage with auth form & error handling | 设计登录页
- Designed ChatPage with Socket.io integration | 设计聊天页并接入 Socket.io
- Built 3-column IM layout (Sidebar + ChatArea) | 构建三栏 IM 布局
- Integrated Hermès brand identity (colors, typography, motion) | 融入爱马仕品牌视觉

**Next | 下一步:**

- Kimi CLI: Message retry queue & offline persistence | 消息重试队列与离线持久化
- VS Code Agent: Friend request UI & group info panel | 好友请求 UI 与群聊信息面板
