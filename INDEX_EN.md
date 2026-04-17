# 📚 ClawChat Documentation Index

> Find the documentation you need quickly

[简体中文](./INDEX.md) | **English**

---

## 🎬 Getting Started (Reading Order)

1. **[README.md](./README_EN.md)** ⭐ START HERE
   - Project overview, quick navigation
   - Reading time: 5 minutes
   - For: Everyone

2. **[ARCHITECTURE_SUMMARY.md](./docs/ARCHITECTURE_SUMMARY.md)**
   - Architecture design summary, key highlights
   - Reading time: 15 minutes
   - For: Everyone who wants quick overview

3. **[PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)**
   - Project roadmap, feature list, milestone plan
   - Reading time: 10 minutes
   - For: Product managers, project leads

---

## 🏛️ Deep Dive (Select by Module)

### Architecture & Design

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** (45 minutes)
  - Layered architecture, microservices, caching, queueing, high availability
  - For: Architects, tech leads
  - Content: Enterprise-grade architecture blueprint

- **[AGENTS.md](./AGENTS_EN.md)** (30 minutes)
  - AI Agent framework, Hermes bridge, integration guide
  - For: AI engineers, integrators
  - Content: Complete agent integration reference

### API & Data Models

- **[API_AND_MODELS.md](./docs/API_AND_MODELS.md)** (1 hour)
  - 100+ API endpoints, 10 data models, WebSocket events
  - For: Backend engineers, DBAs
  - Content: Complete implementation reference

### Deployment & Operations

- **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** (1.5 hours)
  - Docker, Kubernetes, CI/CD, monitoring
  - For: DevOps, Operations engineers
  - Content: Production-ready deployment guide

### Development Standards

- **[DEVELOPMENT_STANDARDS.md](./docs/DEVELOPMENT_STANDARDS.md)** (20 minutes)
  - Code style, commit conventions, PR process
  - For: All developers
  - Content: How to contribute code

- **[CONTRIBUTING.md](./CONTRIBUTING_EN.md)** (30 minutes)
  - Bug reports, feature requests, testing standards
  - For: Contributors
  - Content: Complete contribution guidelines

---

## 🎯 Find by Use Case

### "I want to contribute code"

1. Read: [CONTRIBUTING.md](./CONTRIBUTING_EN.md)
2. Read: [DEVELOPMENT_STANDARDS.md](./docs/DEVELOPMENT_STANDARDS.md)
3. Fork & clone repository
4. Follow workflow: feature branch → tests → PR

### "I want to integrate Hermes agents"

1. Read: [AGENTS.md](./AGENTS_EN.md)
2. Learn: API endpoints (`/api/hermes/register`, etc.)
3. Register your agent in UI
4. Trigger with `@agentname` in messages

### "I want to deploy to production"

1. Read: [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
2. Configure environment variables
3. Run: `./deploy.sh` or `deploy.bat`
4. Monitor health at `/health` endpoint

### "I want to understand the architecture"

1. Read: [ARCHITECTURE_SUMMARY.md](./docs/ARCHITECTURE_SUMMARY.md)
2. Read: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. Browse: [API_AND_MODELS.md](./docs/API_AND_MODELS.md)
4. Explore: Source code at `backend/src/` and `frontend/src/`

### "I found a bug"

1. Check existing issues: [GitHub Issues](https://github.com/yourusername/clawchat/issues)
2. Create new issue with reproduction steps
3. Include: OS, Node version, error logs
4. See: [CONTRIBUTING.md](./CONTRIBUTING_EN.md) for bug report template

### "I have a feature idea"

1. Check existing discussions: [GitHub Discussions](https://github.com/yourusername/clawchat/discussions)
2. Open new issue with use case
3. Suggest implementation approach
4. See: [CONTRIBUTING.md](./CONTRIBUTING_EN.md) for feature request template

---

## 📊 Documentation Statistics

| Document                 | Audience     | Length      | Focus                |
| ------------------------ | ------------ | ----------- | -------------------- |
| README.md                | Everyone     | 130 lines   | Quick start          |
| AGENTS.md                | AI Engineers | 400 lines   | Agent integration    |
| ARCHITECTURE.md          | Architects   | 800 lines   | System design        |
| API_AND_MODELS.md        | Developers   | 1000+ lines | API reference        |
| DEPLOYMENT_GUIDE.md      | DevOps       | 600 lines   | Operations           |
| DEVELOPMENT_STANDARDS.md | Developers   | 500 lines   | Code quality         |
| CONTRIBUTING.md          | Contributors | 700 lines   | Contribution process |
| PROJECT_PLAN.md          | PMs/Leads    | 400 lines   | Roadmap              |

**Total Documentation**: 4500+ lines of comprehensive guides

---

## 🎓 Learning Path by Role

### Frontend Developer

1. README.md → Quick orientation
2. DEVELOPMENT_STANDARDS.md → Code style
3. ARCHITECTURE.md → Frontend layer
4. Explore: `frontend/src/`
5. CONTRIBUTING.md → Submit code

### Backend Developer

1. README.md → Quick orientation
2. DEVELOPMENT_STANDARDS.md → Code style
3. ARCHITECTURE.md → Backend layer
4. API_AND_MODELS.md → API reference
5. Explore: `backend/src/`
6. CONTRIBUTING.md → Submit code

### DevOps Engineer

1. README.md → Project overview
2. DEPLOYMENT_GUIDE.md → Deployment options
3. ARCHITECTURE.md → Infrastructure section
4. Explore: `docker-compose.yml`, `nginx/`
5. Monitor: `/health` endpoint

### AI Integration Engineer

1. README.md → Project overview
2. AGENTS.md → Agent framework
3. ARCHITECTURE.md → Agent layer
4. Test: `/api/hermes/*` endpoints
5. Create custom agent integration

### Project Manager

1. README.md → Feature overview
2. PROJECT_PLAN.md → Roadmap & milestones
3. ARCHITECTURE_SUMMARY.md → Technical summary
4. CONTRIBUTING.md → Contribution process

---

## 🔗 External Resources

### Technology Documentation

- [React 18 Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Best Practices

- [Conventional Commits](https://www.conventionalcommits.org/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [RESTful API Design](https://restfulapi.net/)
- [WebSocket Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### Tools & Services

- [Hermes Agent (Nous Research)](https://github.com/NousResearch/Hermes-3)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ❓ FAQ

### Q: Where should I start?

**A:** Start with [README.md](./README_EN.md), then choose based on your role above.

### Q: How do I report a bug?

**A:** See "I found a bug" section or [CONTRIBUTING.md](./CONTRIBUTING_EN.md).

### Q: How do I contribute code?

**A:** Read [CONTRIBUTING.md](./CONTRIBUTING_EN.md) for complete workflow.

### Q: Is documentation available in other languages?

**A:** Yes! Click language links at top of each document:

- **简体中文** (Simplified Chinese)
- **English**

### Q: Where's the API documentation?

**A:** See [API_AND_MODELS.md](./docs/API_AND_MODELS.md).

### Q: How do I deploy?

**A:** See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md).

### Q: How do I set up Hermes agents?

**A:** See [AGENTS.md](./AGENTS_EN.md).

---

## 📞 Getting Help

- **Issues**: Report bugs at [GitHub Issues](https://github.com/yourusername/clawchat/issues)
- **Discussions**: Ask questions at [GitHub Discussions](https://github.com/yourusername/clawchat/discussions)
- **Email**: Contact team@clawchat.dev
- **Discord**: Join our community (link in README)

---

## 🚀 Quick Links

| Link                                                                | Purpose                       |
| ------------------------------------------------------------------- | ----------------------------- |
| [GitHub Repository](https://github.com/yourusername/clawchat)       | Source code                   |
| [Issues](https://github.com/yourusername/clawchat/issues)           | Bug reports, feature requests |
| [Discussions](https://github.com/yourusername/clawchat/discussions) | Questions, ideas              |
| [Releases](https://github.com/yourusername/clawchat/releases)       | Version history               |
| [Wiki](https://github.com/yourusername/clawchat/wiki)               | Community knowledge base      |

---

**Last Updated:** 2026-04-18 | **Version:** 0.2.0

Made with 🦞 by ClawChat Team
