# 🤝 为 ClawChat 做贡献

[English](./CONTRIBUTING_EN.md) | **简体中文**

我们很高兴能和你一起完善 ClawChat！无论你是修复 bug、添加功能还是改进文档，你的贡献都非常宝贵。

---

## 📋 行为准则

我们致力于为所有贡献者创造热情、包容的环境。

- **尊重他人** — 善待每一个贡献者
- **包容多元** — 欢迎各种背景和经验水平的开发者
- **建设性反馈** — 提供有帮助的建议，而非批评
- **保持专业** — 讨论聚焦于项目

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20
- **Git** 版本控制工具
- **Docker**（可选，开发时用于 MongoDB）

### Fork 和克隆

```bash
# 1. 在 GitHub 上 Fork 仓库
# 2. 克隆你的 Fork
git clone https://github.com/your-username/clawchat.git
cd clawchat

# 3. 添加上游远程仓库
git remote add upstream https://github.com/original-owner/clawchat.git

# 4. 创建功能分支
git checkout -b feature/your-feature-name
```

### 安装依赖

```bash
# 安装所有工作区依赖
npm install

# 编译共享类型
npm run build -w shared

# 启动开发服务器
npm run dev
```

---

## 🔄 开发工作流

### 1. 创建功能分支

总是为你的工作创建新的分支：

```bash
# 分支命名: feature/*, bugfix/*, docs/*, chore/*
git checkout -b feature/agent-voting

# 示例名称
feature/user-authentication
bugfix/socket-disconnect
docs/api-reference
chore/upgrade-dependencies
```

### 2. 进行代码修改

遵循我们的代码标准：

#### 前端（React + TypeScript）

```typescript
// ✅ 好: 函数组件 + TypeScript
interface UserCardProps {
  userId: string;
  username: string;
  onSelect?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ userId, username, onSelect }) => {
  return (
    <div className="user-card" onClick={() => onSelect?.(userId)}>
      <p className="font-semibold">{username}</p>
    </div>
  );
};

// ❌ 避免: any 类型、隐式返回
export const UserCard = ({ user }: any) => <div>{user.name}</div>;
```

#### 后端（Express + TypeScript）

```typescript
// ✅ 好: 服务层抽象
export class UserService {
  constructor(private userRepo = userRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

// ❌ 避免: 在控制器中直接访问数据库
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // 错误!
});
```

### 3. 编写测试

为你的改动添加测试：

```bash
# 运行测试套件
npm run test

# 运行特定测试文件
npm run test -- src/services/UserService.test.ts

# 监听模式
npm run test:watch
```

测试示例：

```typescript
describe('HermesBridgeService', () => {
  it('应该注册一个 Hermes Agent', async () => {
    const service = new HermesBridgeService();
    await service.register({
      name: 'TestAgent',
      baseUrl: 'http://localhost:11434',
      apiKey: 'test-key',
      enabled: true,
    });

    const agents = service.getAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe('TestAgent');
  });
});
```

### 4. 格式化和 lint 代码

```bash
# 用 Prettier 格式化代码
npm run format

# 检查 linting 错误
npm run lint

# 自动修复 linting 错误
npm run lint:fix

# 格式化 + Lint（一起执行）
npm run format:all
```

### 5. 提交你的改动

使用有意义的提交信息，遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```bash
# 格式: <类型>(<范围>): <主题>
# 类型: feat, fix, docs, style, refactor, perf, test, chore

git commit -m "feat(auth): 添加 JWT 令牌刷新端点"
git commit -m "fix(socket): 优雅处理断开连接"
git commit -m "docs(agent): 更新 Hermes 集成指南"
git commit -m "refactor(backend): 简化 UserRepository"
git commit -m "perf(frontend): 用 memo 优化 React 渲染"
git commit -m "test(chat): 添加消息集成测试"
git commit -m "chore: 升级依赖"
```

### 6. 推送并创建 Pull Request

```bash
# 推送到你的 Fork
git push origin feature/your-feature-name

# 前往 GitHub 创建 Pull Request
# 在 PR 模板中填写:
#   - 这个 PR 做了什么
#   - 相关问题 (Closes #123)
#   - 变更类型 (feature, bugfix, docs 等)
#   - 测试内容
#   - 截图（如有 UI 变更）
```

---

## 📝 Pull Request 模板

```markdown
## 描述

简要描述这个 PR 做了什么。

## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性改动
- [ ] 文档更新

## 相关问题

关闭 #123

## 测试

- [ ] 添加了单元测试
- [ ] 添加了集成测试
- [ ] 进行了手动测试

## 截图（如适用）

为 UI 变更添加截图。

## 检查清单

- [ ] 我的代码遵循风格指南
- [ ] 我进行了自查
- [ ] 我为复杂逻辑添加了注释
- [ ] 我更新了相关文档
- [ ] 我的改动不产生新警告
- [ ] 所有测试通过
```

---

## 🐛 报告 Bug

发现 bug？请创建一个包含以下内容的 issue：

1. **标题** — 清晰的标题
2. **描述** — 你预期的行为 vs 实际行为
3. **复现步骤** — 精确的复现步骤
4. **环境** — Node 版本、OS、浏览器
5. **截图** — 如适用
6. **日志** — 错误信息、堆栈跟踪

示例：

```markdown
## Bug: 登录失败并显示 MongoDB 连接错误

### 描述

尝试登录时，即使 MongoDB 已运行，仍然收到
"MongoDB 连接被拒绝"错误。

### 复现步骤

1. 在 .env 中设置 USE_MOCK_DB=false
2. 启动后端服务器: npm run dev
3. 尝试登录: 输入邮箱/密码
4. 错误出现

### 环境

- Node: v20.10.0
- OS: Ubuntu 22.04
- MongoDB: 7.0 本地运行

### 错误日志

\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:27017
at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:5)
\`\`\`

### 预期行为

使用有效凭证登录应该成功。
```

---

## 💡 功能建议

有新功能想法？创建一个包含以下内容的 issue：

1. **标题** — 功能名称
2. **问题** — 解决什么问题？
3. **方案** — 如何实现？
4. **替代方案** — 其他方法？
5. **补充信息** — 示例、草图等

示例：

```markdown
## 功能: 消息搜索和过滤

### 问题

用户无法在大型对话中搜索旧消息。

### 方案

在聊天区域顶部添加搜索框，包含:

- 消息内容全文搜索
- 按发送者过滤
- 按日期范围过滤

### 原型

[ASCII 艺术或截图]

### 接受标准

- [ ] 搜索在 500ms 内返回结果
- [ ] 结果高亮匹配文本
- [ ] 移动端自适应
```

---

## 📚 文档

文档和代码一样重要！

### 添加文档

```bash
# 创建新文档
# 命名: 描述性名称.md (小写用连字符)

# 放在适当的位置
docs/
  ├── en-US/
  │   ├── api-reference.md
  │   └── architecture.md
  └── zh-CN/
      ├── api-reference.md
      └── architecture.md
```

### 文档标准

```markdown
# 标题（H1 标题）

一句话总结。

**语言:** English | 简体中文

---

## 部分（H2）

清晰、简明的解释。

### 小节（H3）

使用代码块作为示例:
\`\`\`typescript
// 代码示例
\`\`\`

使用表格呈现结构信息:

| 列  | 值   |
| --- | ---- |
| 行1 | 数据 |

使用列表呈现步骤:

1. 第一步
2. 第二步
3. 第三步
```

---

## 🏗️ 架构指南

### 文件夹结构

```
backend/src/
├── config/           # 配置文件
├── controllers/      # HTTP 请求处理器
├── middleware/       # Express 中间件
├── models/          # Mongoose 模型
├── repositories/    # 数据访问层
├── services/        # 业务逻辑层
├── sockets/         # Socket.IO 事件处理器
├── utils/           # 工具函数
└── types/           # TypeScript 类型定义

frontend/src/
├── components/      # 可复用 React 组件
├── pages/          # 页面级组件（路由）
├── hooks/          # 自定义 React hooks
├── store/          # Zustand 状态管理
├── services/       # API 调用、工具
├── types/          # TypeScript 类型
└── styles/         # Tailwind CSS、全局样式
```

### 分层模式

```
Controller（HTTP 请求）
    ↓
Service（业务逻辑、验证）
    ↓
Repository（数据访问、抽象）
    ↓
Database（MongoDB、MockDB）
```

**不好的做法：**

```typescript
// ❌ 控制器直接访问数据库
app.post('/users', async (req, res) => {
  const user = await User.create(req.body); // 错误!
});
```

**好的做法：**

```typescript
// ✅ 使用服务层
export class UserController {
  constructor(private userService = new UserService()) {}

  async createUser(req, res) {
    const user = await this.userService.create(req.body);
    res.status(201).json(user);
  }
}
```

---

## 🧪 测试标准

### 测试文件命名

```
src/services/UserService.ts → src/services/UserService.test.ts
src/repositories/UserRepository.ts → src/repositories/UserRepository.test.ts
```

### 测试结构

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('HermesBridgeService', () => {
  let service: HermesBridgeService;

  beforeEach(() => {
    service = new HermesBridgeService();
  });

  afterEach(() => {
    // 清理
  });

  it('应该注册新 Agent', async () => {
    // 准备
    const config = { name: 'Agent1', baseUrl: '...', apiKey: '...' };

    // 执行
    await service.register(config);

    // 断言
    const agents = service.getAgents();
    expect(agents).toContainEqual(expect.objectContaining(config));
  });

  it('应该优雅处理错误', async () => {
    // 期望抛出错误
    expect(() => service.invoke('invalid-id', 'conv-id', [])).rejects.toThrow();
  });
});
```

### 覆盖率目标

- **Services**: 80%+ 覆盖率
- **Controllers**: 60%+ 覆盖率
- **Utilities**: 90%+ 覆盖率
- **Views/Components**: 40%+ 覆盖率

---

## 🔐 安全检查清单

提交 PR 前，确保：

- [ ] 没有硬编码密钥（API keys、密码）
- [ ] 对敏感数据使用环境变量
- [ ] 所有端点都有输入验证
- [ ] 防止 SQL/NoSQL 注入
- [ ] XSS 防护（React 默认转义）
- [ ] CORS 正确配置
- [ ] 受保护路由验证认证令牌
- [ ] 没有使用 console.log() 输出敏感信息

---

## 📊 性能检查清单

- [ ] 没有 N+1 数据库查询
- [ ] 为频繁查询添加索引
- [ ] 大列表实现延迟加载
- [ ] 为昂贵计算实现记忆化
- [ ] Socket.IO 事件优化
- [ ] 前端包体积可接受
- [ ] React 组件无内存泄漏

---

## 🚀 审查流程

1. **自动检查**
   - 测试必须通过
   - Linting 必须通过
   - 代码覆盖率在阈值内

2. **手动审查**
   - 架构审查
   - 代码质量审查
   - 安全审查
   - 文档审查

3. **批准**
   - 至少 1 个维护者批准
   - 所有讨论解决
   - 冲突已解决

4. **合并**
   - 功能分支使用"Squash and merge"
   - 发布分支使用"Rebase and merge"

---

## 💬 获取帮助

- **Discord/Slack** — 加入我们的社区提出快速问题
- **GitHub Discussions** — 进行开放性讨论
- **GitHub Issues** — 报告 bug 和功能请求
- **邮箱** — 联系维护者: team@clawchat.dev

---

## 📝 许可证

通过对 ClawChat 做贡献，你同意你的贡献将在 MIT 许可证下授权。

---

## 🎉 感谢！

感谢为 ClawChat 做贡献！每一个贡献，无论多小，都帮助这个项目变得更好。🦞

---

**有问题?** 创建一个 issue 或在 [GitHub Discussions](https://github.com/yourusername/clawchat/discussions) 中联系我们。
