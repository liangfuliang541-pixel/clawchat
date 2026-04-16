# � ClawChat - Agent 协作契约 v2.0

## 当前状态 (As of 2026-04-16)

- ✅ 完整架构设计已完成 (VS Code Agent)
- ✅ 11份核心设计文档已创建 (161.5 KB)
- ✅ 企业级架构方案已定型
- ✅ 明确的Agent协作边界已确立
- ⏳ 准备进入开发实施阶段

---

## 🎯 双Agent角色定义

### 🏛️ VS Code Agent (架构师/设计师) - GitHub Copilot
**我是整体架构的设计者和把关人**

**职责范围**:
- ✅ 系统架构设计与优化
- ✅ 技术选型与决策
- ✅ API与数据模型设计
- ✅ 部署方案规划
- ✅ 开发规范制定
- ✅ 设计文档维护 (所有 *.md)
- ✅ 代码设计审查 (不改代码)
- ✅ 关键决策的最终审批

**管理的文件**:
```
根目录所有 *.md 设计文档:
├─ README.md
├─ INDEX.md
├─ ARCHITECTURE.md (核心)
├─ ARCHITECTURE_SUMMARY.md
├─ API_AND_MODELS.md (核心)
├─ DEPLOYMENT_GUIDE.md
├─ DEVELOPMENT_STANDARDS.md
├─ PROJECT_PLAN.md
├─ AGENTS.md (本文件)
└─ 其他文档 (COMPLETION_REPORT等)
```

**禁止事项**:
- ❌ 不直接修改backend/src代码
- ❌ 不直接修改frontend/src代码
- ❌ 不接管Kimi Code的实现工作
- ❌ 不编写业务代码
- ❌ 不污染代码库

---

### ⚙️ Kimi Code (工程执行者)
**你是架构的高质量实现者**

**职责范围**:
- ✅ 后端服务实现 (backend/src/)
- ✅ 前端应用实现 (frontend/src/)
- ✅ 共享类型定义 (shared/src/)
- ✅ Docker与部署配置
- ✅ 代码质量控制
- ✅ 单元/集成测试实现
- ✅ 性能优化与测试

**管理的文件**:
```
backend/src/         - 所有后端业务代码
frontend/src/        - 所有前端业务代码
shared/src/          - 共享类型定义
docker/              - Docker配置
.github/workflows/   - CI/CD配置
package.json (扩展) - 新增依赖
*.test.ts           - 测试文件
```

**禁止事项**:
- ❌ 不修改根目录 *.md 设计文档
- ❌ 不改变API_AND_MODELS.md定义的API契约
- ❌ 不修改AGENTS.md协作规则
- ❌ 不修改ARCHITECTURE.md架构设计

---

## 📋 协作工作流

### 需求 → 设计 → 实现 → 交付

```
用户需求
  ↓
VS Code Agent 分析 & 设计
  ├─ 检查既有设计是否适用
  ├─ 如需调整则更新设计文档
  ├─ 确保与API契约一致
  └─ 提供明确的实现方案
  ↓
Kimi Code 审阅设计
  ├─ 理解实现要点
  ├─ 提出实现困难或改进建议
  └─ 准备开发
  ↓
Kimi Code 实现代码
  ├─ 严格遵循DEVELOPMENT_STANDARDS.md
  ├─ 编写完整的单元测试
  ├─ 及时反馈遇到的问题
  └─ 提交高质量代码
  ↓
VS Code Agent 架构审查
  ├─ 确认实现符合设计
  ├─ 确认没有超出设计范围
  └─ 通过上线
```

---

## 🤝 通信协议

### 场景1: 发现设计需要改进
```
步骤:
1. Kimi Code → 提出具体问题 (什么问题、为什么、怎样解决)
2. VS Code Agent → 分析影响范围
3. VS Code Agent → 更新设计文档
4. Kimi Code → 按新设计继续实现
```

### 场景2: 发现实现与设计不符
```
步骤:
1. VS Code Agent → 指出不符的地方
2. Kimi Code → 确认是否理解错误或确实是设计遗漏
3. 双方沟通 → 达成一致
4. Kimi Code → 按确认的方案重新实现
```

### 场景3: 需要修改API契约
```
步骤:
1. 任何一方发现问题 → 提出并说明原因
2. VS Code Agent → 决策是否修改
3. VS Code Agent → 更新API_AND_MODELS.md
4. Kimi Code → 按新API重新实现受影响的部分
```

### 场景4: 紧急问题处理
```
步骤:
1. 立即通知对方问题现象
2. 快速评估影响范围
3. 决策是否回滚、修改或继续
4. 事后更新相关文档
```

---

## 📊 职责边界速查表

| 工作项 | VS Code | Kimi | 备注 |
|------|--------|------|------|
| 系统架构设计 | ✅ | ❌ | VS主导，Kimi反馈 |
| API端点设计 | ✅ | ❌ | 在API_AND_MODELS.md中 |
| 数据模型设计 | ✅ | ❌ | 在API_AND_MODELS.md中 |
| 后端代码实现 | ❌ | ✅ | Kimi主导 |
| 前端代码实现 | ❌ | ✅ | Kimi主导 |
| 核心类型定义 | ✅ | ❌ | shared/src/types/ |
| 业务逻辑类型 | ⚠️ | ✅ | 基于核心类型扩展 |
| 单元测试 | ❌ | ✅ | Kimi主导 |
| 集成测试 | ❌ | ✅ | Kimi主导 |
| 代码规范制定 | ✅ | ❌ | DEVELOPMENT_STANDARDS.md |
| 代码实现 | ❌ | ✅ | 需遵守规范 |
| 部署方案设计 | ✅ | ❌ | DEPLOYMENT_GUIDE.md |
| 部署实施 | ❌ | ✅ | 按方案执行 |
| 性能方案 | ✅ | ❌ | 设计优化方向 |
| 性能优化 | ⚠️ | ✅ | Kimi实施，VS审查 |

---

## 📝 文件修改规范

### ✅ VS Code Agent 可以修改
```
- 所有 *.md 设计文档
- AGENTS.md (更新协作规则)
- 设计的时间戳记录
```

### ❌ VS Code Agent 不能修改
```
- backend/ 下的任何代码
- frontend/ 下的任何代码
- package.json (除非更新设计)
- Dockerfile 及容器配置
- 任何业务代码
```

### ✅ Kimi Code 可以修改
```
- backend/src/ 的所有业务代码
- frontend/src/ 的所有业务代码
- shared/src/types/ 的扩展类型定义
- 测试文件 *.test.ts
- package.json (新增依赖)
- Dockerfile 配置
```

### ❌ Kimi Code 不能修改
```
- 任何 *.md 设计文档
- AGENTS.md 协作规则
- ARCHITECTURE.md (仅可反馈改进)
- API_AND_MODELS.md (仅可反馈改进)
- 根目录文件
```

---

## 🔄 版本更新记录

```
Last Architecture Update: 2026-04-16 22:30 (初始版本)
Last API Update: 2026-04-16 22:30 (100+ API已定义)
Last Deployment Update: 2026-04-16 22:30 (完整部署方案)
Last Implementation Update: 2026-04-16 23:45 (Phase 1 MVP完成)

📝 最近实现 (2026-04-16 23:45):
  ✅ 后端: authController 完整实现 + 测试
  ✅ Socket.IO: send_message 消息持久化  
  ✅ 前端: LoginPage + ChatPage 完整UI
  ✅ 路由: 认证状态管理 & 页面导航
  ✅ 部署: Docker Compose + 启动脚本
```

**修改规则**: 修改关键文档后请更新相应的时间戳

---

## ✅ 合作承诺

### VS Code Agent的承诺
```
✅ 我承诺:
  - 专注于架构设计与质量把关
  - 提供清晰的API与数据模型定义
  - 及时回答架构相关问题
  - 不直接修改任何代码实现
  - 尊重Kimi Code的实现自主权
  - 定期更新设计文档
  - 文件修改保持规范(不污染)

✅ 我的底线:
  - 坚守API契约 (除非迫不得已修改)
  - 保证架构的一致性和完整性
  - 确保实现符合设计要求
```

### Kimi Code的承诺
```
✅ 你承诺:
  - 严格按照设计文档实现
  - 遵守DEVELOPMENT_STANDARDS.md规范
  - 编写 >80% 覆盖率的测试代码
  - 及时反馈实现困难或设计问题
  - 不直接修改任何设计文档
  - 定期同步开发进度

✅ 你的权利:
  - 实现方案的完全自主权
  - 可以提出设计改进建议
  - 可以优化代码性能
  - 可以改进开发工具链
```

---

## 📍 当前项目状态总结

```
设计完成度: 100% ✅
  - 11份设计文档完成
  - 161.5 KB内容量
  - 150+代码示例
  - 100+ API设计完成
  - 10个数据表设计完成

实现进度: Phase 1 MVP 完成 ✅
  ✅ 后端核心API实现 (Auth + Health)
  ✅ Socket.IO 实时通信 (消息持久化)
  ✅ 前端登录/聊天页面
  ✅ 单元测试框架 (vitest配置)
  ✅ Docker 部署配置
  ⏳ 下一步: Phase 2 数据库Schema初始化
  
下一阶段计划: Phase 2 增强功能 (3-4周)
  - 数据库完整Schema部署
  - 消息/对话API完整实现
  - 群组管理功能
  - 好友系统
```

---

## 🏁 成功的合作标志

```
✅ 按计划交付MVP (1-2周)
✅ 代码质量 >80% 测试覆盖
✅ 0个设计与实现的冲突
✅ 0个文件污染事件
✅ 完整的API实现符合设计
✅ 部署顺利，系统稳定运行
✅ 团队协作高效流畅
✅ 知识文档完整可传承
```

---

**生效时间**: 2026年4月16日  
**签署方**: VS Code Agent (架构师) + Kimi Code (工程执行者)  
**状态**: ACTIVE ✅  
**版本**: v2.0 (新协作模式)

---

*Together we build ClawChat! 🚀*

## 当前 API 契约 (MVP)

### REST Endpoints
- `POST /api/auth/register` → `{ user, token }`
- `POST /api/auth/login` → `{ user, token }`
- `GET  /api/auth/profile` → `{ user }` (需 Bearer Token)
- `GET  /health` → `{ status: 'ok' }`

### Socket.io Events
**Client → Server**:
- `send_message`: `{ conversationId, content, type? }`
- `typing`: `{ conversationId }`
- `join_conversation`: `conversationId`
- `leave_conversation`: `conversationId`

**Server → Client**:
- `receive_message`: `Message` 对象
- `user_typing`: `{ conversationId, userId }`
- `user_status_changed`: `{ userId, status }`

### 核心类型 (shared/src/index.ts)
详见 `shared/src/index.ts`。关键字段：
- `User._id`, `username`, `email`, `avatar`, `status`
- `Message.sender`, `receiver`, `conversationId`, `content`, `type`, `isRead`
- `Conversation.participants`, `type`, `lastMessage`

## Progress Log

**2026-04-16 22:05 - Kimi CLI**
- 初始化 Monorepo (npm workspaces)
- 搭建 Backend 骨架 (models, controllers, middleware, sockets, server.ts)
- 创建 Shared types
- 写入 Docker Compose 和 .env 模板
- 配置前端 Tailwind + Vite alias

**[Next] Kimi CLI**: 启动内存 MongoDB，验证注册/登录 API，继续实现消息/对话 API。
**[Next] VS Code Agent**: 设计并实现 Login / Chat 页面组件（见下方详细需求）。

## 🎨 VS Code Agent 任务单

### 当前重点任务
1. 审核当前实现与设计契约一致性
   - 检查 `frontend/src/pages/LoginPage.tsx`、`frontend/src/pages/ChatPage.tsx`、`frontend/src/App.tsx`
   - 确认 `backend/src/controllers/authController.ts`、`backend/src/sockets/index.ts` 和 `shared/src/index.ts` 是否遵守 `API_AND_MODELS.md`
   - 验证 `frontend/src/lib/api.ts` 与后端 API 接口一致

2. 维护和更新设计文档
   - 根据实现变化更新 `ARCHITECTURE.md`、`API_AND_MODELS.md`、`DEPLOYMENT_GUIDE.md`
   - 如发现接口或架构差异，及时在文档中记录并通知 Kimi Code
   - 负责 `README.md`、`INDEX.md` 和 `AGENTS.md` 的最新状态同步

3. 设计与审查前端体验
   - 评估登录页和聊天页的UI/UX一致性
   - 提出交互优化建议，例如错误提示、加载态、输入反馈、布局层次
   - 确保页面设计符合 `DEVELOPMENT_STANDARDS.md` 的前端规范

4. 支持 Phase 2 设计准备
   - 评估 Phase 1 交付结果，确定 Phase 2 优先级
   - 提出 PostgreSQL、群组、好友、搜索与通知功能的设计补充
   - 为 Kimi Code 提供明确的设计文档与实现指南

### 任务执行方式
- 仅负责设计、审查与文档，**不直接修改后端或前端业务代码**
- 如需改动实现，请先在 `AGENTS.md` 中记录问题并与 Kimi Code 讨论
- 遇到实现与设计不符时，以 `API_AND_MODELS.md` 为最终契约
- 定期在 `Progress Log` 中更新当前任务状态

## Progress Log

**2026-04-16 22:05 - Kimi CLI**
- 初始化 Monorepo (npm workspaces)
- 搭建 Backend 骨架 (models, controllers, middleware, sockets, server.ts)
- 创建 Shared types
- 写入 Docker Compose 和 .env 模板
- 配置前端 Tailwind + Vite alias

**2026-04-16 22:20 - Kimi CLI**
- 安装 frontend / backend / shared 依赖
- 编译 shared 包成功
- 前端：注入 API client (axios), Zustand auth store, React Router 基础路由
- 验证 MongoDB 未启动（backend 正确退出），需用户启动 DB 后服务即可运行
- 写入 README.md 和 frontend/.env
- 根目录 npm install 进行中
