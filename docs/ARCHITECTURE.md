# ClawChat - 企业级架构设计方案

## 🎯 设计哲学

本方案遵循以下核心原则：

- **可扩展性第一**: 从Day 1就考虑未来10倍用户增长
- **高可用性**: 99.9%+ 的服务可用性
- **渐进式发展**: MVP → 增强 → 平台化
- **技术债务控制**: 正确的技术选型，避免未来重构
- **运维友好**: 易于监控、调试、部署

---

## 📐 整体架构设计

### 分层架构图

```
┌─────────────────────────────────────────┐
│          客户端层 (多端支持)              │
│  Web | iOS | Android | Desktop          │
└────────────────┬────────────────────────┘
                 │ HTTPS/WSS
┌────────────────▼────────────────────────┐
│         API网关层 (Gateway)              │
│  Nginx/Kong - 负载均衡、限流、认证      │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌─────▼────┐  ┌───▼────┐
│REST  │  │WebSocket │  │gRPC    │
│API   │  │(实时)    │  │(内部)  │
└───┬──┘  └─────┬────┘  └───┬────┘
    │           │           │
┌───▼───────────▼───────────▼────┐
│       业务服务层 (微服务)        │
│                                 │
│ ┌──────────┐ ┌──────────┐      │
│ │User Svc  │ │Message   │      │
│ │          │ │Svc       │      │
│ └──────────┘ └──────────┘      │
│                                 │
│ ┌──────────┐ ┌──────────┐      │
│ │Group Svc │ │Search    │      │
│ │          │ │Svc       │      │
│ └──────────┘ └──────────┘      │
└───┬───────────┬───────────┬────┘
    │           │           │
┌───▼──┐   ┌───▼──┐    ┌───▼────┐
│数据库 │   │缓存  │    │消息队列 │
│层     │   │层    │    │(Queue) │
└──────┘   └──────┘    └────────┘
```

---

## 🏗️ 详细架构方案

### 1. 网络层设计

#### 1.1 API网关策略

```
生产环境配置:
- 主网关: Nginx (开源、高性能、久经考验)
- CDN: Cloudflare 或 阿里CDN (全球加速)
- 限流: 每个用户 100req/min, 突发500req
- 缓存策略:
  * 静态资源: 304缓存, 1小时TTL
  * API响应: 根据类型, 5-300秒TTL
  * 用户列表: 30秒TTL
```

#### 1.2 实时通信架构

```
WebSocket连接管理:
- Socket.IO v4 (带自动降级)
- 连接池: 使用Redis管理分布式会话
- 心跳: 25秒一次keep-alive
- 重连策略: 指数退避, 最大延迟60秒
- 单机承载: ~10,000 并发连接
```

---

### 2. 后端微服务架构

#### 2.1 服务划分

```yaml
核心服务 (Core Services):

  User Service:
    - 职责: 用户认证、授权、个人信息管理
    - 数据库: PostgreSQL (结构化数据)
    - 缓存: Redis (用户session, 权限缓存)
    - 特性:
      * OAuth2 + JWT 双重认证
      * 用户权限管理 (RBAC)
      * 黑名单管理
    - 可扩展性: 无状态设计, 支持水平扩展

  Message Service:
    - 职责: 消息存储、检索、递送
    - 数据库:
      * PostgreSQL: 消息元数据(sender, receiver, timestamp)
      * MongoDB: 消息内容(支持灵活扩展)
    - 缓存: Redis (最近消息缓存)
    - 特性:
      * 消息去重 (UUID)
      * 优先级队列 (紧急消息优先)
      * 消息分页(cursor-based)
    - 可扩展性: 按conversation分片存储

  Group Service:
    - 职责: 群组管理、成员权限
    - 数据库: PostgreSQL
    - 缓存: Redis (群组成员列表)
    - 特性:
      * 分级权限 (Admin, Manager, Member)
      * 消息模式 (全部/@ 提及)
    - 可扩展性: 成员列表分页加载

  Search Service:
    - 职责: 全文搜索、用户搜索、消息搜索
    - 引擎: Elasticsearch v7+
    - 特性:
      * 全文搜索(中文分词)
      * 用户搜索(名称、昵称)
      * 消息搜索(按时间、关键词)
    - 可扩展性: ES集群自动扩展

  Notification Service:
    - 职责: 推送通知、邮件通知
    - 类型: FCM(Android), APNs(iOS), Email
    - 队列: Kafka (异步处理)
    - 特性:
      * 智能推送(避免轰炸)
      * 用户偏好设置
      * 统计分析

  File Service:
    - 职责: 文件上传、存储、分发
    - 存储: AWS S3 或 阿里OSS
    - CDN: CloudFront 或 CDN加速
    - 特性:
      * 秒传(MD5校验)
      * 文件预览
      * 病毒扫描
    - 可扩展性: 无限存储容量
```

#### 2.2 数据一致性设计

```yaml
强一致性场景 (PostgreSQL事务):
  - 用户认证
  - 账号操作
  - 群组权限变更

最终一致性场景 (异步队列):
  - 消息分发
  - 用户状态更新
  - 统计数据更新
  - 缓存更新

实现方案:
  - 事件驱动: 每个主要操作发布事件
  - 消息队列: RabbitMQ / Kafka
  - 补偿机制: 定时检查不一致数据
  - 版本控制: 乐观锁防止并发冲突
```

---

### 3. 数据存储层

#### 3.1 数据库选型

```
关系型数据库: PostgreSQL 14+
├─ 用户表: users (索引: email, username)
├─ 认证表: auth_tokens (索引: user_id, token)
├─ 群组表: groups (索引: user_id)
├─ 群组成员: group_members (复合索引: group_id, user_id)
├─ 对话表: conversations (索引: user_id)
├─ 消息元数据: messages_metadata (索引: conv_id, created_at)
└─ 关系表: friendships, blocks (索引: from_user_id, to_user_id)

文档数据库: MongoDB 5.0+
├─ 消息内容: messages (分片: conversation_id)
│   └─ TTL索引: 自动删除90天前消息
├─ 用户扩展信息: user_profiles
└─ 群组扩展信息: group_profiles

搜索引擎: Elasticsearch 7.x
├─ 消息索引: messages (分片: 按日期)
├─ 用户索引: users
└─ 动态配置: 自动mapping

缓存数据库: Redis 6.0+
├─ 用户session: user:{id}:session (TTL: 7天)
├─ 消息缓存: conv:{id}:messages (TTL: 1天)
├─ 在线状态: online:users (Set)
├─ 未读计数: unread:{user_id} (Hash)
└─ 速率限制: rate_limit:{user_id} (Counter)
```

#### 3.2 数据库分片策略

```
用户维度分片:
  - Hash(user_id) % N_SHARDS
  - 预期: 初期N=4, 后期N=16

消息存储分片:
  - Hash(conversation_id) % N_SHARDS
  - MongoDB采用Hash分片键

热点数据处理:
  - 活跃用户的消息: 单独Redis缓存
  - 大群消息: 按小时分表 + 归档
  - 历史消息: 冷存储(S3)
```

---

### 4. 缓存架构 (Cache-Aside模式)

```
缓存分层策略:

L1: 本地缓存 (应用进程内)
├─ 用途: 频繁访问的小数据
├─ 大小限制: 单个服务 100MB
├─ 过期: 通过消息队列主动更新
└─ 实现: Caffeine / Guava Cache

L2: 分布式缓存 (Redis集群)
├─ 用途: 会话、用户信息、消息缓存
├─ 配置: 3主3从 + Sentinel自动故障转移
├─ 淘汰: LRU策略, 内存上限 100GB
└─ 持久化: RDB(生产环境) + AOF备份

缓存更新流程:
1. 写操作: DB → 发布事件 → 清缓存 → 返回
2. 读操作: 缓存Hit → 返回 / Miss → DB → 写缓存 → 返回
3. 故障转移: 缓存失效 → DB查询 → 异步更新缓存

缓存预热:
- 启动时: 加载热点数据 (前1000活跃用户)
- 定时: 每小时刷新过期数据
- 需求: 用户首次登录时异步预加载
```

---

### 5. 消息队列架构

```
消息队列设计 (RabbitMQ / Kafka 选择)

场景1: 实时消息分发 (低延迟)
├─ 技术: RabbitMQ
├─ 模式: Direct Exchange + 消费者确认
├─ 特性: 毫秒级分发, 支持优先级
└─ 可靠性: 消息持久化 + 消费者事务

场景2: 异步通知 (可延迟)
├─ 技术: Kafka
├─ 分区: user_id % partitions
├─ 特性: 高吞吐, 消费者组自动负载均衡
└─ 保证: At-least-once 语义

典型消息类型:
1. message.sent - 消息发送完成
   ├─ 触发: Message Service
   ├─ 消费:
   │  ├─ 用户通知服务(推送)
   │  ├─ 搜索索引更新
   │  └─ 统计服务(消息数++)
   └─ 延迟: <100ms

2. user.status.changed - 用户状态变化
   ├─ 触发: User Service
   ├─ 消费:
   │  ├─ WebSocket广播
   │  ├─ 好友列表更新
   │  └─ 统计记录
   └─ 延迟: <500ms

3. group.member.added - 群组成员加入
   ├─ 触发: Group Service
   ├─ 消费:
   │  ├─ 推送通知
   │  ├─ 权限更新
   │  └─ 审计日志
   └─ 延迟: <1s

消费者管理:
- 优雅关闭: 15秒超时, 自动重试
- 死信处理: 3次失败后进入死信队列
- 监控: 消费延迟告警 (>1min)
```

---

### 6. 实时通信架构 (Socket.IO)

```
连接管理:

单机配置 (单个Node进程):
  - 最大连接: 10,000
  - 内存占用: ~50MB per 1,000 connections
  - CPU占用: 5-10% @ 50% 负载

集群配置 (Redis Adapter):
  - 粘性会话: 用户始终连接到同一服务器
  - 消息广播: 通过Redis Pub/Sub
  - 故障转移: 用户自动重连到其他服务器

消息可靠性:
1. 单播消息 (一对一聊天)
   ├─ 发送: 发件人 → 服务器确认 → 收件人
   ├─ 确认: ACK机制 + 超时重试
   └─ 持久化: 离线消息存DB, 上线时补发

2. 广播消息 (群聊)
   ├─ 发送: 发件人 → 服务器 → 所有在线成员
   ├─ 离线成员: 异步推送通知
   └─ 可靠性: At-most-once (可接受)

3. 系统消息 (通知)
   ├─ 发送: 系统 → 服务器 → 用户
   ├─ 持久化: 存储在通知表
   └─ 可靠性: Exactly-once (必须)

命名空间设计:
  /chat              - 聊天消息
  /presence          - 用户状态
  /notifications     - 系统通知
  /groups/:groupId   - 群组消息
```

---

### 7. 高可用性设计

```
故障转移策略:

数据库故障:
  - 主从复制: PostgreSQL Replication
  - 自动转移: 使用Patroni或pg_auto_failover
  - RPO: 0秒 (同步复制)
  - RTO: <30秒 (自动故障转移)
  - 备份: 每日完全备份 + 增量备份

缓存故障:
  - Redis Sentinel: 自动主从转移
  - Cluster模式: 16个分片, 每个2从
  - 降级: 缓存失效时回源DB (限流保护)

服务故障:
  - 服务健康检查: 每10秒一次
  - 熔断器: 故障阈值50%, 恢复时间60s
  - 限流: Token Bucket 50% - 100% 逐步恢复
  - 重试策略: 指数退避, 最大3次

消息队列故障:
  - 集群: 3节点最小化
  - 副本: 消息备份到3个节点
  - DLQ: 失败消息进入死信队列
  - 补偿: 定时扫描未处理消息

地域容灾 (可选):
  - 主集群: 地区A (生产)
  - 从集群: 地区B (备用)
  - 同步: 异步复制 (RPO < 10s)
  - 切换: 手动或DNS切换
```

---

### 8. 性能优化

```
前端性能 (Web):
  - 代码分割: 按路由分割 (chunk < 100KB)
  - 图片优化: WebP格式 + 懒加载
  - 缓存策略: Service Worker + Cache API
  - 加载: 首屏LCP < 2.5s, FID < 100ms

后端性能:
  - 接口响应: p99 < 200ms (不含网络延迟)
  - 数据库查询: p99 < 50ms
  - 缓存命中率: > 90%
  - 索引策略:
    * 消息查询: (conversation_id, created_at)
    * 用户搜索: (username) + 全文索引
    * 群组成员: (group_id, user_id)

消息处理:
  - 消息延迟: p99 < 100ms (点对点)
  - 群消息: p99 < 500ms (100人群)
  - 文件上传: 5MB文件 < 10s (高速网络)

批处理优化:
  - 消息列表: 每页50条, cursor分页
  - 用户搜索: 首页20条 + 分页
  - 消息搜索: ES聚合 + Redis缓存
```

---

### 9. 安全架构

```
认证与授权:
  - 认证: OAuth2 (WeChat/QQ登录) + JWT
  - Token: 访问令牌(15min) + 刷新令牌(7天)
  - 会话: Redis存储, 支持多设备登录限制
  - RBAC: User -> Role -> Permission

数据安全:
  - 传输: TLS 1.3 + HSTS
  - 存储: 密码Bcrypt + Salt, 敏感数据AES加密
  - 消息: 端到端加密(可选, Phase 2)
  - 日志: 审计日志 (谁在何时做了什么)

API安全:
  - 限流: 用户级 + IP级 + 全局限流
  - WAF: Cloudflare WAF规则
  - CORS: 严格同源策略
  - 签名: 支持请求签名验证
  - 检验: 输入验证 + SQL注入防护

人员安全:
  - 权限分离: 生产环境访问控制
  - 密钥轮换: API密钥每3个月轮换
  - 日志审计: 所有管理操作记录
  - 事件告警: 异常登录、数据导出告警
```

---

### 10. 部署架构

```
开发环境 (单机, Docker):
  docker-compose:
    - PostgreSQL 1个
    - Redis 1个
    - Elasticsearch 1个
    - RabbitMQ 1个
    - 后端服务 N个
    - Nginx 1个

测试环境:
  - 后端: 2个副本 (通过Nginx负载均衡)
  - 数据库: 主从配置
  - 消息队列: 单节点(足够)
  - 缓存: 单实例(可选集群)

生产环境:
  - 后端: 10-20个副本 (自动扩展)
  - API网关: 2个Nginx (主备)
  - 数据库: PostgreSQL 1主2从
  - 缓存: Redis 3主3从 + Sentinel
  - 消息队列: RabbitMQ/Kafka 3节点集群
  - Elasticsearch: 3节点集群 + 2个协调节点

容器编排:
  - Kubernetes (生产推荐)
  - Docker Swarm (中等规模)
  - 自建脚本 (初期快速验证)
```

---

## 📊 分阶段实施计划

### Phase 1: MVP (第1-2周) - 证明概念

**目标**: 可工作的原型, 验证核心业务逻辑

**架构简化**:

```
├─ 单体后端 (Node.js)
├─ PostgreSQL (不做分片)
├─ Redis (单实例)
├─ React前端
└─ Nginx反向代理
```

**核心功能**:

- [x] 用户注册登录（JWT + X-API-Key）
- [x] 一对一私聊 (WebSocket)
- [x] 群组管理与群聊
- [x] 在线状态
- [x] 消息已读
- [x] 智能体框架（Agent 注册 / API 发消息）
- [x] Hermes Agent 桥接

**技术栈** (实际实现):

- 后端: Express.js + TypeScript + Socket.IO + Mongoose + Zod + Pino
- 数据库: MongoDB + Redis（MockDB 零依赖回退）
- 前端: React 18 + Vite + Tailwind CSS v3 + Zustand + TanStack Query

**交付物**: 可演示的Web应用

---

### Phase 2: 增强 (第3-4周) - 性能与功能

**目标**: 支持1万DAU, 完整核心功能

**架构升级**:

```
├─ 后端: 微服务分离
│  ├─ User Service (单独部署)
│  ├─ Message Service (单独部署)
│  └─ Notification Service
├─ 消息队列: RabbitMQ
├─ 搜索: Elasticsearch
└─ 缓存优化
```

**新功能**:

- [ ] 群组管理
- [ ] 消息搜索
- [ ] 文件上传
- [ ] 推送通知

**优化**:

- [ ] 消息分页 (cursor-based)
- [ ] 缓存架构 (L1+L2)
- [ ] 数据库查询优化 + 索引

**交付物**: 完整的MVP应用

---

### Phase 3: 平台化 (第5-8周) - 高可用与扩展

**目标**: 支持10万DAU, 99.9%可用性

**架构升级**:

```
├─ 完整微服务 (5+ 服务)
├─ 集群化:
│  ├─ PostgreSQL 主从复制
│  ├─ Redis Cluster (6+ 节点)
│  ├─ Elasticsearch 集群
│  └─ RabbitMQ 集群
├─ CDN集成
├─ 地域容灾 (可选)
└─ Kubernetes编排
```

**新功能**:

- [ ] 端到端加密 (可选)
- [ ] 消息反应 (Emoji)
- [ ] 消息编辑与撤回
- [ ] 语音/视频通话信令

**优化**:

- [ ] 故障自动转移
- [ ] 自动扩缩容
- [ ] 成本优化

---

### Phase 4: 商业化 (第9-12周)

**目标**: 支持百万DAU, 完整商业功能

- [ ] 付费功能
- [ ] 广告系统
- [ ] 分析看板
- [ ] 用户增长

---

## 🔧 技术选型决策表

| 功能     | 选项                | 推荐                    | 理由                        |
| -------- | ------------------- | ----------------------- | --------------------------- |
| 后端框架 | Express/Fastify/Koa | Express                 | 生态最成熟, NPM包最多       |
| 实时通信 | Socket.IO/WebSocket | Socket.IO               | 自动降级, 更稳定            |
| 消息队列 | RabbitMQ/Kafka      | RabbitMQ初期, Kafka扩展 | RabbitMQ延迟低, Kafka吞吐高 |
| 数据库   | PostgreSQL/MySQL    | PostgreSQL              | JSON支持, 功能完整          |
| 搜索引擎 | Elasticsearch/Solr  | Elasticsearch           | 中文分词支持好              |
| 缓存     | Redis/Memcached     | Redis                   | 功能丰富, 支持集群          |
| 前端框架 | React/Vue/Angular   | React                   | 生态最完整, 性能最好        |
| 容器化   | Docker/Podman       | Docker                  | 业界标准                    |
| 编排     | K8s/Docker Swarm    | K8s                     | 功能完整, 长期投资          |

---

## 📈 预期的可扩展性

```
DAU规模增长与基础设施对应:

1,000 DAU:
  └─ 1x应用服务器 (2vCPU, 4GB RAM)
     1x PostgreSQL (2vCPU, 8GB RAM)
     1x Redis (单实例, 2GB)
     成本: ~$300/月

10,000 DAU:
  └─ 5x应用服务器 (Nginx LB)
     1x PostgreSQL (4vCPU, 16GB, 主从)
     1x Redis (3节点集群, 6GB)
     成本: ~$2,000/月

100,000 DAU:
  └─ 20x应用服务器 (K8s)
     3x PostgreSQL (8vCPU, 32GB, 主2从)
     3x Redis (6节点, 20GB)
     3x Elasticsearch (8vCPU, 16GB)
     3x RabbitMQ (主从)
     成本: ~$15,000/月

1,000,000 DAU:
  └─ 多地域部署
     完整微服务架构
     异地容灾
     成本: ~$150,000/月+
```

---

## 🚨 风险与应对

| 风险           | 影响                 | 概率 | 应对措施            |
| -------------- | -------------------- | ---- | ------------------- |
| 数据库写入热点 | 消息全部到某个分片   | 中   | 哈希分片 + 热点检测 |
| Redis内存溢出  | 缓存失效, 回源冲击DB | 中   | LRU淘汰 + 定期维护  |
| 大群消息爆炸   | 消息队列堆积         | 低   | 限流 + 降级处理     |
| 网络分割       | 可用性下降           | 低   | 集群配置 + 健康检查 |
| 第三方依赖故障 | 服务中断             | 低   | 熔断器 + 降级方案   |

---

## 📋 代码架构规范

```
后端项目结构:
src/
├── config/           - 配置管理
├── controllers/      - 请求处理
├── services/         - 业务逻辑
├── models/          - 数据模型
├── repositories/    - 数据访问层
├── middleware/      - Express中间件
├── utils/           - 工具函数
├── jobs/            - 定时任务
├── events/          - 事件定义
├── sockets/         - WebSocket处理
├── tests/           - 单元测试
└── main.ts          - 入口

代码规范:
- TypeScript严格模式
- ESLint + Prettier
- 单元测试覆盖 > 80%
- 代码审查制度 (PR)
- 变更日志 (CHANGELOG)

Git工作流:
main (生产) ← develop (测试) ← feature/* (开发)
```

---

## ✅ 设计原则总结

1. **简单胜于复杂**: 初期不过度设计, 按需演进
2. **可测试性**: 所有模块独立可测
3. **可维护性**: 代码注释清晰, 文档完整
4. **可观测性**: 日志、指标、追踪全覆盖
5. **可扩展性**: 从第一行代码就考虑Scale
6. **成本意识**: 每个技术决策都算过成本
7. **用户体验**: 性能和功能平衡

---

## 🎯 下一步行动

请选择优先级:

1. **立即开始** Phase 1 MVP开发
2. **详细设计** 数据库ER图与API文档
3. **搭建环境** Docker compose本地开发环境
4. **代码生成** 自动生成项目脚手架

建议顺序: 3 → 4 → 2 → 1

你的决定?
