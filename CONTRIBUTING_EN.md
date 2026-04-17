# 🤝 Contributing to ClawChat

**English** | [简体中文](./CONTRIBUTING_CN.md)

We'd love your help in making ClawChat even better! Whether you're fixing bugs, adding features, or improving documentation, your contributions are invaluable.

---

## 📋 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.

- **Be Respectful** — Treat everyone with kindness and respect
- **Be Inclusive** — Welcome contributors of all backgrounds and experience levels
- **Be Constructive** — Provide helpful feedback, not criticism
- **Be Professional** — Keep discussions focused on the project

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20
- **Git** for version control
- **Docker** (optional, for MongoDB during development)

### Fork & Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/yourusername/clawchat.git
cd clawchat

# 3. Add upstream remote
git remote add upstream https://github.com/original-owner/clawchat.git

# 4. Create feature branch
git checkout -b feature/your-feature-name
```

### Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Build shared types
npm run build -w shared

# Start development servers
npm run dev
```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Branch naming: feature/*, bugfix/*, docs/*, chore/*
git checkout -b feature/agent-voting

# Example names
feature/user-authentication
bugfix/socket-disconnect
docs/api-reference
chore/upgrade-dependencies
```

### 2. Make Your Changes

Follow our code standards:

#### Frontend (React + TypeScript)

```typescript
// ✅ Good: Functional component with TypeScript
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

// ❌ Avoid: Any types, implicit returns
export const UserCard = ({ user }: any) => <div>{user.name}</div>;
```

#### Backend (Express + TypeScript)

```typescript
// ✅ Good: Service layer abstraction
export class UserService {
  constructor(private userRepo = userRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

// ❌ Avoid: Direct repository access in controllers
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // Wrong!
});
```

### 3. Write Tests

Add tests for your changes:

```bash
# Run test suite
npm run test

# Run specific test file
npm run test -- src/services/UserService.test.ts

# Watch mode
npm run test:watch
```

Example test:

```typescript
describe('HermesBridgeService', () => {
  it('should register a Hermes agent', async () => {
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

### 4. Format & Lint Your Code

```bash
# Format code with Prettier
npm run format

# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format + Lint (all at once)
npm run format:all
```

### 5. Commit Your Changes

Use meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, perf, test, chore

git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(socket): handle disconnect gracefully"
git commit -m "docs(agent): update Hermes integration guide"
git commit -m "refactor(backend): simplify UserRepository"
git commit -m "perf(frontend): optimize React rendering with memo"
git commit -m "test(chat): add integration tests for messages"
git commit -m "chore: upgrade dependencies"
```

### 6. Push & Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
# Fill in the PR template with:
#   - What this PR does
#   - Related issues (Closes #123)
#   - Type of change (feature, bugfix, docs, etc.)
#   - Testing done
#   - Screenshots (if UI changes)
```

---

## 📝 Pull Request Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing done

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added comments for complex logic
- [ ] I have updated relevant documentation
- [ ] My changes generate no new warnings
- [ ] All tests pass
```

---

## 🐛 Reporting Bugs

Found a bug? Please create an issue with:

1. **Title** — Clear, descriptive title
2. **Description** — What you expected vs. what happened
3. **Steps to Reproduce** — Exact steps to reproduce the issue
4. **Environment** — Node version, OS, browser
5. **Screenshots** — If applicable
6. **Logs** — Error messages, stack traces

Example:

```markdown
## Bug: Login fails with MongoDB connection error

### Description

When I try to login, I get a "MongoDB connection refused" error,
even though MongoDB is running.

### Steps to Reproduce

1. Set USE_MOCK_DB=false in .env
2. Start backend server: npm run dev
3. Try to login: enter email/password
4. Error appears

### Environment

- Node: v20.10.0
- OS: Ubuntu 22.04
- MongoDB: 7.0 running locally

### Error Log
```

Error: connect ECONNREFUSED 127.0.0.1:27017
at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:5)

```

### Expected Behavior
Login should succeed with valid credentials.
```

---

## 💡 Suggesting Features

Have an idea for a new feature? Open an issue with:

1. **Title** — Clear feature name
2. **Problem** — What problem does it solve?
3. **Solution** — How would you implement it?
4. **Alternatives** — Other approaches?
5. **Additional Context** — Examples, mockups, etc.

Example:

```markdown
## Feature: Message search and filtering

### Problem

Users cannot search through old messages in large conversations.

### Solution

Add a search box at top of chat area with:

- Full-text search in message content
- Filter by sender
- Filter by date range

### Mockup

[ASCII art or screenshot]

### Acceptance Criteria

- [ ] Search returns relevant messages within 500ms
- [ ] Results highlight matching text
- [ ] Mobile responsive
```

---

## 📚 Documentation

Documentation is as important as code!

### Adding Documentation

```bash
# Create new docs
# Naming: descriptive-name.md (lowercase with hyphens)

# Place in appropriate location
docs/
  ├── en-US/
  │   ├── api-reference.md
  │   └── architecture.md
  └── zh-CN/
      ├── api-reference.md
      └── architecture.md
```

### Documentation Standards

```markdown
# Title (H1 heading)

One-sentence summary.

**Languages:** English | 简体中文

---

## Section (H2)

Clear, concise explanations.

### Subsection (H3)

Use code blocks for examples:
\`\`\`typescript
// Code example
\`\`\`

Use tables for structured info:

| Column | Value |
| ------ | ----- |
| Row 1  | Data  |

Use lists for steps:

1. First step
2. Second step
3. Third step
```

---

## 🏗️ Architecture Guidelines

### Folder Structure

```
backend/src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── middleware/       # Express middleware
├── models/          # Mongoose schemas
├── repositories/    # Data access layer
├── services/        # Business logic layer
├── sockets/         # Socket.IO handlers
├── utils/           # Utility functions
└── types/           # TypeScript type definitions

frontend/src/
├── components/      # Reusable React components
├── pages/          # Page-level components (Route)
├── hooks/          # Custom React hooks
├── store/          # Zustand state management
├── services/       # API calls, utilities
├── types/          # TypeScript types
└── styles/         # Tailwind CSS, global styles
```

### Layering Pattern

```
Controller (HTTP request)
    ↓
Service (business logic, validation)
    ↓
Repository (data access, abstraction)
    ↓
Database (MongoDB, MockDB)
```

**Bad Practice:**

```typescript
// ❌ Controller directly accessing database
app.post('/users', async (req, res) => {
  const user = await User.create(req.body); // Wrong!
});
```

**Good Practice:**

```typescript
// ✅ Using service layer
export class UserController {
  constructor(private userService = new UserService()) {}

  async createUser(req, res) {
    const user = await this.userService.create(req.body);
    res.status(201).json(user);
  }
}
```

---

## 🧪 Testing Standards

### Test File Naming

```
src/services/UserService.ts → src/services/UserService.test.ts
src/repositories/UserRepository.ts → src/repositories/UserRepository.test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('HermesBridgeService', () => {
  let service: HermesBridgeService;

  beforeEach(() => {
    service = new HermesBridgeService();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should register a new agent', async () => {
    // Arrange
    const config = { name: 'Agent1', baseUrl: '...', apiKey: '...' };

    // Act
    await service.register(config);

    // Assert
    const agents = service.getAgents();
    expect(agents).toContainEqual(expect.objectContaining(config));
  });

  it('should handle errors gracefully', async () => {
    // Expect error to be thrown
    expect(() => service.invoke('invalid-id', 'conv-id', [])).rejects.toThrow();
  });
});
```

### Coverage Goals

- **Services**: 80%+ coverage
- **Controllers**: 60%+ coverage
- **Utilities**: 90%+ coverage
- **Views/Components**: 40%+ coverage

---

## 🔐 Security Checklist

Before submitting a PR, ensure:

- [ ] No hardcoded secrets (API keys, passwords)
- [ ] Environment variables used for sensitive data
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection (React escapes by default)
- [ ] CORS properly configured
- [ ] Auth tokens validated on protected routes
- [ ] No console.log() with sensitive data

---

## 📊 Performance Checklist

- [ ] No N+1 database queries
- [ ] Indexes added for frequent queries
- [ ] Lazy loading for large lists
- [ ] Memoization for expensive computations
- [ ] Socket.IO events optimized
- [ ] Frontend bundle size acceptable
- [ ] No memory leaks in React components

---

## 🚀 Review Process

1. **Automatic Checks**
   - Tests must pass
   - Linting must pass
   - Code coverage within threshold

2. **Manual Review**
   - Architecture review
   - Code quality review
   - Security review
   - Documentation review

3. **Approval**
   - At least 1 maintainer approval
   - All conversations resolved
   - Conflicts resolved

4. **Merge**
   - "Squash and merge" for feature branches
   - "Rebase and merge" for release branches

---

## 💬 Getting Help

- **Discord/Slack** — Join our community for quick questions
- **GitHub Discussions** — For open-ended discussions
- **GitHub Issues** — For bugs and feature requests
- **Email** — Contact maintainers: team@clawchat.dev

---

## 📝 License

By contributing to ClawChat, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Thank you for contributing to ClawChat! Every contribution, no matter how small, helps make this project better. 🦞

---

**Questions?** Open an issue or reach out in [GitHub Discussions](https://github.com/yourusername/clawchat/discussions).
