# 🌍 ClawChat - Internationalization (i18n)

**English** | [简体中文](./INTERNATIONALIZATION_CN.md)

ClawChat is a **fully bilingual open-source project** with support for both English and Simplified Chinese across all documentation and code.

---

## 📚 Documentation Multilingual Support

### Main Documentation Files

| Document             | 中文                                                       | English                                              |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| README               | [README.md](./README.md)                                   | [README_EN.md](./README_EN.md)                       |
| Agents Guide         | [AGENTS.md](./AGENTS.md)                                   | [AGENTS_EN.md](./AGENTS_EN.md)                       |
| Contributing Guide   | [CONTRIBUTING_CN.md](./CONTRIBUTING_CN.md)                 | [CONTRIBUTING_EN.md](./CONTRIBUTING_EN.md)           |
| Documentation Index  | [INDEX.md](./INDEX.md)                                     | [INDEX_EN.md](./INDEX_EN.md)                         |
| Internationalization | [INTERNATIONALIZATION_CN.md](./INTERNATIONALIZATION_CN.md) | [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md) |

### Architecture & Deep Dive Docs

Located in `docs/` directory:

```
docs/
├── ARCHITECTURE.md                    # (English primary)
├── ARCHITECTURE_SUMMARY.md            # (English primary)
├── API_AND_MODELS.md                  # (English primary)
├── DEPLOYMENT_GUIDE.md                # (English primary)
├── DEVELOPMENT_STANDARDS.md           # (English primary)
├── PROJECT_PLAN.md                    # (English primary)
├── en-US/                             # English translations
│   └── (future translations)
└── zh-CN/                             # Chinese translations
    └── (future translations)
```

---

## 💻 Code Comments & Inline Documentation

### Bilingual Code Comments

The codebase uses bilingual comments where helpful:

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

### Language Guidelines

1. **Code identifiers** — Use English (universal programming language)

   ```typescript
   ✅ const userRepository = new UserRepository();
   ❌ const 用户仓库 = new 用户仓库();
   ```

2. **Comments** — Use relevant language or bilingual

   ```typescript
   // English comment - 中文注释
   // Useful for complex business logic
   ```

3. **Error messages** — Can be localized in future

   ```typescript
   throw new NotFoundError('User not found'); // Future: i18n system
   ```

4. **Logs** — Use English
   ```typescript
   logger.info({ agent: config.name }, 'Hermes agent registered');
   ```

---

## 📝 How to Add New Language Support

### Step 1: Create Language Directory

```bash
# Create directory for new language (use ISO 639-1 code)
mkdir -p docs/ja-JP      # Japanese
mkdir -p docs/es-ES      # Spanish
mkdir -p docs/fr-FR      # French
```

### Step 2: Translate Core Documents

Priority order for translation:

1. **README** (highest visibility)
2. **CONTRIBUTING** (attracts contributors)
3. **AGENTS** (for AI integrators)
4. **ARCHITECTURE** (for developers)
5. **API_AND_MODELS** (reference material)
6. **DEPLOYMENT_GUIDE** (for ops teams)

### Step 3: Add Language Links

Update existing docs with language switcher:

```markdown
# Document Title

**English** | [简体中文](./path-to-cn-version) | [日本語](./path-to-jp-version)
```

### Step 4: Create Translation Guidelines

Create a `TRANSLATION_GUIDE_[lang].md` file with:

- Key terminology translations
- Common phrases
- Tone & voice guidelines
- Examples

---

## 🌐 Frontend UI Localization (Planned)

### v0.3.0 - UI i18n Support

Future versions will include:

```typescript
// Planned: Multi-language UI with i18next
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

### Translation Files Structure

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

### Example Translation File

```json
{
  "common": {
    "send": "Send",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "chat": {
    "title": "Conversations",
    "noMessages": "No messages yet",
    "placeholder": "Type a message..."
  }
}
```

---

## 🚀 Translation Contribution Workflow

### For New Translators

1. **Choose a document** to translate from [Open Translations](https://github.com/yourusername/clawchat/discussions/translations)
2. **Comment** on the issue claiming it
3. **Fork** the repository
4. **Create branch**: `docs/translate-[lang]-[document]`
5. **Translate** maintaining formatting, code blocks, links
6. **Submit PR** with:
   - Title: `docs(i18n): add [Lang] translation of [Document]`
   - Description: Language, document name, reference if applicable
7. **Review** by native speaker
8. **Merge** upon approval

### Translation PR Template

```markdown
## Translation: [Language] - [Document Name]

### Details

- **Language**: [Language Name] (ISO code)
- **Document**: [Document name]
- **Translator**: @yourname
- **Native Speaker Reviewer**: (if available)

### Checklist

- [ ] All content translated
- [ ] Formatting preserved
- [ ] Code blocks unchanged
- [ ] Links updated to translated versions
- [ ] No machine translation (human translation preferred)
- [ ] Terminology consistent with style guide
- [ ] Peer reviewed by native speaker

### Notes

Any specific challenges or decisions made during translation.
```

---

## 📊 Translation Status

### Complete (100%)

- ✅ README (中文 | English)
- ✅ AGENTS (中文 | English)
- ✅ CONTRIBUTING (中文 | English)
- ✅ INDEX (中文 | English)
- ✅ INTERNATIONALIZATION (中文 | English)

### In Progress (50%)

- 🔄 ARCHITECTURE (English primary, 中文 pending)
- 🔄 API_AND_MODELS (English primary, 中文 pending)
- 🔄 DEPLOYMENT_GUIDE (English primary, 中文 pending)

### Not Started (0%)

- ⏳ PROJECT_PLAN (multiple languages)
- ⏳ DEVELOPMENT_STANDARDS (multiple languages)
- ⏳ Frontend UI strings (v0.3.0+)

---

## 🔑 Key Translation Terms

### Technical Terms (Keep Consistent)

| English     | 中文                | Notes                   |
| ----------- | ------------------- | ----------------------- |
| Agent       | 智能体 / Agent      | Can use either          |
| Repository  | 仓库                | Data access layer       |
| Service     | 服务                | Business logic layer    |
| Controller  | 控制器              | HTTP handlers           |
| Middleware  | 中间件              | Express middleware      |
| Socket      | 套接字 / Socket     | Real-time communication |
| Thread      | 线程 / 会话         | Conversation thread     |
| Group Chat  | 群聊                | Multiple users          |
| 1-on-1 Chat | 单聊 / 私聊         | Two users               |
| Mock DB     | MockDB / 模拟数据库 | In-memory test DB       |
| Schema      | 数据模型 / Schema   | MongoDB schema          |
| Query       | 查询                | Database query          |
| Index       | 索引                | Database index          |

### Project-Specific Terms

| English  | 中文     | Context                         |
| -------- | -------- | ------------------------------- |
| ClawChat | ClawChat | Product name                    |
| Hermes   | Hermes   | Agent framework (Nous Research) |
| Hermès   | Hermès   | Brand (French luxury brand)     |
| Lobster  | 龙虾     | Brand symbol                    |
| Claw     | 虾爪     | Brand element                   |
| Bridge   | 桥接     | Agent integration               |

---

## 🎨 Tone & Voice Guidelines

### By Language

#### English

- **Tone**: Professional, friendly, clear
- **Style**: Active voice, direct instructions
- **Examples**: "Install dependencies", "Register an agent"

#### 中文 (Simplified Chinese)

- **Tone**: 专业、友好、清晰
- **Style**: 被动语态可接受，书面语
- **Examples**: "安装依赖项", "注册一个智能体"

---

## 📱 Accessibility in Multiple Languages

### Considerations

- **Font support**: Ensure fonts support character sets (CJK for Chinese)
- **Text direction**: Support LTR (English) and potential RTL languages
- **Date/time formats**: Localize per language preferences
- **Number formats**: Different decimal/thousand separators
- **Currency**: Support local currencies
- **Gender grammar**: Some languages have gendered nouns

### Future Implementation

```typescript
// Planned: Language-aware formatting
const formatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
```

---

## ✅ Translation Checklist

When submitting a translation:

- [ ] All sections translated
- [ ] Code examples unchanged
- [ ] Links preserved (update to translated versions)
- [ ] Tables formatted correctly
- [ ] Lists and numbering preserved
- [ ] Headers and emphasis (`**bold**`, `*italic*`) preserved
- [ ] Images/diagrams have alt text
- [ ] No machine-only translation (proof-read by human)
- [ ] Terminology consistent throughout
- [ ] Grammar and spelling checked
- [ ] Cultural references adapted if needed
- [ ] File naming matches convention (`DOCUMENT_[LANG].md`)

---

## 🤝 Translator Recognition

### Hall of Fame

Translators are recognized in:

1. `TRANSLATORS.md` file (main repo)
2. GitHub contributor page
3. Release notes for their language
4. Community shout-out on social media

### Example

```markdown
## 🌟 Translators

### 中文 (Simplified Chinese)

- **@translator_name** — README, AGENTS, CONTRIBUTING

### 日本語 (Japanese)

- **@translator_name** — README

### Español (Spanish)

- **@translator_name** — ARCHITECTURE

---

**Thank you to all translators making ClawChat global! 🙏**
```

---

## 📞 Translation Support

- **Forum**: [Translation Discussions](https://github.com/yourusername/clawchat/discussions/categories/translations)
- **Email**: translations@clawchat.dev
- **Discord**: #translations channel
- **Guide**: This document (INTERNATIONALIZATION.md)

---

## 🎯 Long-Term Vision

### Phase 1 (Current - v0.2.0) ✅

- English + 中文 documentation
- Bilingual code comments
- Translation contribution workflow

### Phase 2 (v0.3.0)

- 5+ language documentation support
- Frontend UI i18n framework
- Language selector in web app

### Phase 3 (v0.4.0)

- Real-time language auto-detection
- Community translation platform integration
- Audio/speech support in multiple languages

### Phase 4 (v1.0.0)

- 20+ language support
- Mobile app i18n
- Enterprise localization services

---

**Made with 🦞 by ClawChat Team | Helping developers worldwide communicate** 🌍

---

**Questions about translation?**

- Open an issue: [GitHub Issues](https://github.com/yourusername/clawchat/issues)
- Join discussions: [GitHub Discussions](https://github.com/yourusername/clawchat/discussions)
- Contact: translations@clawchat.dev
