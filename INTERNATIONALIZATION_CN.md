# 🌍 ClawChat - 国际化 (i18n)

[English](./INTERNATIONALIZATION.md) | **简体中文**

ClawChat 是一个**完全双语的开源项目**，在所有文档和代码中都支持英文和简体中文。

---

## 📚 文档多语言支持

### 主要文档文件

| 文档       | 中文                                                       | English                                              |
| ---------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| 项目首页   | [README.md](./README.md)                                   | [README_EN.md](./README_EN.md)                       |
| 智能体指南 | [AGENTS.md](./AGENTS.md)                                   | [AGENTS_EN.md](./AGENTS_EN.md)                       |
| 贡献指南   | [CONTRIBUTING_CN.md](./CONTRIBUTING_CN.md)                 | [CONTRIBUTING_EN.md](./CONTRIBUTING_EN.md)           |
| 文档索引   | [INDEX.md](./INDEX.md)                                     | [INDEX_EN.md](./INDEX_EN.md)                         |
| 国际化指南 | [INTERNATIONALIZATION_CN.md](./INTERNATIONALIZATION_CN.md) | [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md) |

### 架构与深度文档

位于 `docs/` 目录:

```
docs/
├── ARCHITECTURE.md                    # (英文主要版本)
├── ARCHITECTURE_SUMMARY.md            # (英文主要版本)
├── API_AND_MODELS.md                  # (英文主要版本)
├── DEPLOYMENT_GUIDE.md                # (英文主要版本)
├── DEVELOPMENT_STANDARDS.md           # (英文主要版本)
├── PROJECT_PLAN.md                    # (英文主要版本)
├── en-US/                             # 英文翻译
│   └── (即将推出)
└── zh-CN/                             # 中文翻译
    └── (即将推出)
```

---

## 💻 代码注释和内联文档

### 双语代码注释

代码库在必要时使用双语注释：

```typescript
// 🤖 Hermes Agent Bridge Service - 智能体桥接服务
export class HermesBridgeService {
  // Register an external Hermes agent - 注册外部 Hermes 智能体
  async register(config: HermesAgentConfig): Promise<void> {
    // Implementation
  }

  // Invoke agent API with conversation history - 使用对话历史调用智能体 API
  async invoke(
    agentId: string,
    conversationId: string,
    history: ChatMessage[]
  ): Promise<string | null> {
    // Implementation
  }
}
```

### 语言指南

1. **代码标识符** — 使用英文（通用编程语言）

   ```typescript
   ✅ const userRepository = new UserRepository();
   ❌ const 用户仓库 = new 用户仓库();
   ```

2. **注释** — 使用相关语言或双语

   ```typescript
   // English comment - 中文注释
   // Useful for complex business logic
   ```

3. **错误消息** — 可在未来本地化

   ```typescript
   throw new NotFoundError('User not found'); // Future: i18n system
   ```

4. **日志** — 使用英文
   ```typescript
   logger.info({ agent: config.name }, 'Hermes agent registered');
   ```

---

## 📝 如何添加新语言支持

### 步骤 1: 创建语言目录

```bash
# 创建新语言目录（使用 ISO 639-1 代码）
mkdir -p docs/ja-JP      # 日语
mkdir -p docs/es-ES      # 西班牙语
mkdir -p docs/fr-FR      # 法语
```

### 步骤 2: 翻译核心文档

翻译优先级顺序：

1. **README** (最高可见性)
2. **CONTRIBUTING** (吸引贡献者)
3. **AGENTS** (面向 AI 集成者)
4. **ARCHITECTURE** (面向开发者)
5. **API_AND_MODELS** (参考资料)
6. **DEPLOYMENT_GUIDE** (面向运维团队)

### 步骤 3: 添加语言链接

在现有文档中添加语言切换器：

```markdown
# 文档标题

**简体中文** | [English](./path-to-en-version) | [日本語](./path-to-jp-version)
```

### 步骤 4: 创建翻译指南

创建 `TRANSLATION_GUIDE_[lang].md` 文件，包含：

- 关键术语翻译
- 常见短语
- 语调和声音指南
- 示例

---

## 🌐 前端 UI 本地化（规划中）

### v0.3.0 - UI 国际化支持

未来版本将包括：

```typescript
// 规划: 使用 i18next 的多语言 UI
import { useTranslation } from 'react-i18next';

export const ChatPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('chat.title')}</h1>
      <button>{t('common.send')}</button>
    </div>
  );
};
```

### 翻译文件结构

```
frontend/src/locales/
├── en-US/
│   ├── common.json
│   ├── chat.json
│   ├── auth.json
│   └── agent.json
└── zh-CN/
    ├── common.json
    ├── chat.json
    ├── auth.json
    └── agent.json
```

### 翻译文件示例

```json
{
  "common": {
    "send": "发送",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑"
  },
  "chat": {
    "title": "对话",
    "noMessages": "还没有消息",
    "placeholder": "输入消息..."
  }
}
```

---

## 🚀 翻译贡献工作流

### 对于新翻译者

1. **选择一份文档** 从 [开放翻译项目](https://github.com/yourusername/clawchat/discussions/translations)
2. **评论** 在问题上声明
3. **Fork** 仓库
4. **创建分支**: `docs/translate-[lang]-[document]`
5. **翻译** 保持格式、代码块、链接
6. **提交 PR**，包含：
   - 标题: `docs(i18n): add [Lang] translation of [Document]`
   - 描述: 语言、文档名称、参考资料（如适用）
7. **审查** 由母语使用者
8. **合并** 批准后

### 翻译 PR 模板

```markdown
## 翻译: [语言] - [文档名称]

### 详情

- **语言**: [语言名称] (ISO 代码)
- **文档**: [文档名称]
- **翻译者**: @yourname
- **母语审查员**: (如果可用)

### 检查清单

- [ ] 所有内容已翻译
- [ ] 格式已保留
- [ ] 代码块未改动
- [ ] 链接已更新为翻译版本
- [ ] 无机器翻译（优先人工翻译）
- [ ] 术语与风格指南一致
- [ ] 经过母语使用者同行评审

### 备注

翻译过程中的特殊挑战或决定。
```

---

## 📊 翻译状态

### 完成 (100%)

- ✅ README (中文 | English)
- ✅ AGENTS (中文 | English)
- ✅ CONTRIBUTING (中文 | English)
- ✅ INDEX (中文 | English)
- ✅ INTERNATIONALIZATION (中文 | English)

### 进行中 (50%)

- 🔄 ARCHITECTURE (英文主要, 中文待处理)
- 🔄 API_AND_MODELS (英文主要, 中文待处理)
- 🔄 DEPLOYMENT_GUIDE (英文主要, 中文待处理)

### 未开始 (0%)

- ⏳ PROJECT_PLAN (多语言)
- ⏳ DEVELOPMENT_STANDARDS (多语言)
- ⏳ 前端 UI 字符串 (v0.3.0+)

---

## 🔑 关键翻译术语

### 技术术语（保持一致）

| English     | 中文                | 备注           |
| ----------- | ------------------- | -------------- |
| Agent       | 智能体 / Agent      | 可使用任一     |
| Repository  | 仓库                | 数据访问层     |
| Service     | 服务                | 业务逻辑层     |
| Controller  | 控制器              | HTTP 处理器    |
| Middleware  | 中间件              | Express 中间件 |
| Socket      | 套接字 / Socket     | 实时通信       |
| Thread      | 线程 / 会话         | 对话线程       |
| Group Chat  | 群聊                | 多用户         |
| 1-on-1 Chat | 单聊 / 私聊         | 两个用户       |
| Mock DB     | MockDB / 模拟数据库 | 内存测试 DB    |
| Schema      | 数据模型 / Schema   | MongoDB 模型   |
| Query       | 查询                | 数据库查询     |
| Index       | 索引                | 数据库索引     |

### 项目特定术语

| English  | 中文     | 语境                       |
| -------- | -------- | -------------------------- |
| ClawChat | ClawChat | 产品名                     |
| Hermes   | Hermes   | 智能体框架 (Nous Research) |
| Hermès   | Hermès   | 品牌（法国奢侈品牌）       |
| Lobster  | 龙虾     | 品牌符号                   |
| Claw     | 虾爪     | 品牌元素                   |
| Bridge   | 桥接     | 智能体集成                 |

---

## 🎨 语调和声音指南

### 按语言分类

#### 英文 (English)

- **语调**: 专业、友好、清晰
- **风格**: 主动语态、直接指令
- **示例**: "Install dependencies", "Register an agent"

#### 中文 (Simplified Chinese)

- **语调**: 专业、友好、清晰
- **风格**: 被动语态可接受、书面语
- **示例**: "安装依赖项", "注册一个智能体"

---

## 📱 多语言无障碍考虑

### 考虑因素

- **字体支持**: 确保字体支持字符集（中文 CJK）
- **文本方向**: 支持 LTR（英文）和潜在的 RTL 语言
- **日期/时间格式**: 根据语言偏好本地化
- **数字格式**: 不同的小数/千分位分隔符
- **货币**: 支持本地货币
- **语法性别**: 某些语言有带性别的名词

### 未来实现

```typescript
// 规划: 语言感知格式化
const formatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
```

---

## ✅ 翻译检查清单

提交翻译时：

- [ ] 所有部分已翻译
- [ ] 代码示例未改动
- [ ] 链接已保留（更新为翻译版本）
- [ ] 表格格式正确
- [ ] 列表和编号已保留
- [ ] 标题和强调（`**粗体**`、`*斜体*`）已保留
- [ ] 图像/图表有替代文本
- [ ] 非仅机器翻译（由人类校对）
- [ ] 术语整体一致
- [ ] 语法和拼写已检查
- [ ] 文化参考已适配（如需要）
- [ ] 文件命名遵循约定（`DOCUMENT_[LANG].md`）

---

## 🤝 翻译者认可

### 名人堂

翻译者在以下位置获得认可：

1. `TRANSLATORS.md` 文件（主仓库）
2. GitHub 贡献者页面
3. 其语言的发布说明
4. 社交媒体社区喝彩

### 示例

```markdown
## 🌟 翻译者

### 简体中文 (Simplified Chinese)

- **@translator_name** — README, AGENTS, CONTRIBUTING

### 日本語 (Japanese)

- **@translator_name** — README

### Español (Spanish)

- **@translator_name** — ARCHITECTURE

---

**感谢所有翻译者使 ClawChat 成为全球项目！🙏**
```

---

## 📞 翻译支持

- **论坛**: [翻译讨论](https://github.com/yourusername/clawchat/discussions/categories/translations)
- **邮箱**: translations@clawchat.dev
- **Discord**: #translations 频道
- **指南**: 本文档 (INTERNATIONALIZATION_CN.md)

---

## 🎯 长期愿景

### 阶段 1（当前 - v0.2.0） ✅

- 英文 + 中文文档
- 双语代码注释
- 翻译贡献工作流

### 阶段 2（v0.3.0）

- 5+ 种语言文档支持
- 前端 UI 国际化框架
- Web 应用语言选择器

### 阶段 3（v0.4.0）

- 实时语言自动检测
- 社区翻译平台集成
- 多语言音频/语音支持

### 阶段 4（v1.0.0）

- 20+ 种语言支持
- 移动应用国际化
- 企业本地化服务

---

**由 ClawChat Team 用 🦞 制造 | 帮助全球开发者交流** 🌍

---

**对翻译有疑问？**

- 创建问题: [GitHub Issues](https://github.com/yourusername/clawchat/issues)
- 加入讨论: [GitHub Discussions](https://github.com/yourusername/clawchat/discussions)
- 联系: translations@clawchat.dev
