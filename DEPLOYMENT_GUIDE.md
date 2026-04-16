# ClawChat - 技术栈与部署指南

## 🛠️ 完整技术栈

### 前端技术栈

```yaml
框架层:
  - React 18.2.0          # UI框架
  - TypeScript 5.0+       # 类型系统
  - Vite 4.x              # 打包工具 (极速)

状态管理:
  - Zustand 4.x           # 轻量级状态管理
  - React Query 3.x       # 服务器状态管理
  - immer                 # 不可变数据更新

UI组件库:
  - Ant Design 5.x        # 企业级UI组件
  - react-icons          # 图标库

实时通信:
  - Socket.io-client 4.x  # WebSocket客户端
  - axios 1.x             # HTTP客户端

工具库:
  - dayjs                 # 时间处理
  - lodash-es             # 工具函数
  - nanoid                # ID生成
  - zod                   # 数据验证

开发工具:
  - ESLint 8.x            # 代码检查
  - Prettier 3.x          # 代码格式化
  - Vitest 0.x            # 单元测试
  - Cypress               # E2E测试

浏览器支持:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
```

### 后端技术栈

```yaml
运行环境:
  - Node.js 18 LTS+       # JavaScript运行时
  - npm 8+ 或 yarn 3+     # 包管理器

核心框架:
  - Express.js 4.x        # Web框架 (稳定)
  - Socket.io 4.x         # WebSocket服务器

数据库:
  - PostgreSQL 14+        # 主数据库 (关系)
  - MongoDB 5.x           # 文档数据库 (灵活)
  - Redis 6.x+            # 缓存/队列

搜索引擎:
  - Elasticsearch 7.x+    # 全文搜索

消息队列:
  - RabbitMQ 3.12+        # 消息队列 (实时)
  - Kafka 3.x             # 消息流 (可选, 高吞吐)

认证与安全:
  - jsonwebtoken 9.x      # JWT生成与验证
  - bcryptjs 2.x          # 密码加密
  - helmet 7.x            # HTTP安全头
  - cors 2.x              # CORS中间件

文件存储:
  - AWS SDK               # S3或其他对象存储
  - multer                # 文件上传中间件

工具库:
  - dotenv                # 环境变量管理
  - joi                   # 数据验证
  - winston               # 日志库
  - pino                  # 高性能日志

开发工具:
  - TypeScript 5.x        # 类型系统
  - ts-node               # TypeScript执行
  - nodemon               # 文件监听重启
  - ESLint 8.x            # 代码检查
  - Jest 29.x             # 单元测试
  - Supertest             # HTTP测试

部署工具:
  - Docker                # 容器化
  - Docker Compose        # 容器编排 (本地)
  - Kubernetes            # 容器编排 (生产)
  - PM2                   # 进程管理 (可选)
```

---

## 📦 项目目录结构详解

### 前端项目结构

```
frontend/
├── public/                      # 静态资源
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── assets/                  # 图片、字体等
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │
│   ├── components/              # 可复用组件
│   │   ├── common/              # 通用组件
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── chat/                # 聊天相关
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── InputBox.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── TypingIndicator.tsx
│   │   │
│   │   ├── user/                # 用户相关
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   └── group/               # 群组相关
│   │       ├── GroupCard.tsx
│   │       ├── GroupSettings.tsx
│   │       └── MemberList.tsx
│   │
│   ├── pages/                   # 页面组件
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── ChatLayout.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   └── SearchChat.tsx
│   │   │
│   │   ├── user/
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── FriendsList.tsx
│   │   │   └── BlockList.tsx
│   │   │
│   │   └── group/
│   │       ├── GroupList.tsx
│   │       ├── GroupDetail.tsx
│   │       └── CreateGroup.tsx
│   │
│   ├── store/                   # 状态管理 (Zustand)
│   │   ├── authStore.ts         # 认证状态
│   │   ├── chatStore.ts         # 聊天状态
│   │   ├── userStore.ts         # 用户状态
│   │   ├── groupStore.ts        # 群组状态
│   │   └── uiStore.ts           # UI状态 (主题等)
│   │
│   ├── services/                # 业务服务层
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── message.ts
│   │   │   ├── conversation.ts
│   │   │   ├── group.ts
│   │   │   └── friendship.ts
│   │   │
│   │   ├── socket/
│   │   │   ├── socketService.ts
│   │   │   ├── listeners.ts
│   │   │   └── emitters.ts
│   │   │
│   │   └── storage/
│   │       ├── localStorage.ts
│   │       └── sessionStorage.ts
│   │
│   ├── hooks/                   # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useSocket.ts
│   │   ├── useUser.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── format.ts            # 格式化函数
│   │   ├── validate.ts          # 验证函数
│   │   ├── storage.ts           # 存储操作
│   │   ├── request.ts           # HTTP请求配置
│   │   └── constants.ts         # 常量定义
│   │
│   ├── types/                   # TypeScript类型定义
│   │   ├── api.ts               # API响应类型
│   │   ├── models.ts            # 数据模型类型
│   │   ├── socket.ts            # Socket事件类型
│   │   └── index.ts             # 类型导出
│   │
│   ├── config/                  # 配置文件
│   │   ├── api.ts               # API基础URL
│   │   ├── socket.ts            # Socket配置
│   │   └── constants.ts         # 常量配置
│   │
│   ├── App.tsx                  # 根组件
│   └── main.tsx                 # 入口文件
│
├── .env.example                 # 环境变量示例
├── .eslintrc.cjs                # ESLint配置
├── .prettierrc                  # Prettier配置
├── tsconfig.json                # TypeScript配置
├── vite.config.ts               # Vite配置
├── package.json
└── README.md
```

### 后端项目结构

```
backend/
├── src/
│   ├── config/                  # 配置管理
│   │   ├── database.ts          # 数据库连接
│   │   ├── redis.ts             # Redis连接
│   │   ├── socket.ts            # Socket.IO配置
│   │   ├── env.ts               # 环境变量
│   │   └── constants.ts         # 常量定义
│   │
│   ├── models/                  # 数据模型
│   │   ├── User.ts
│   │   ├── Message.ts
│   │   ├── Conversation.ts
│   │   ├── Group.ts
│   │   ├── Friendship.ts
│   │   ├── Notification.ts
│   │   └── index.ts
│   │
│   ├── repositories/            # 数据访问层 (DAL)
│   │   ├── UserRepository.ts
│   │   ├── MessageRepository.ts
│   │   ├── ConversationRepository.ts
│   │   ├── GroupRepository.ts
│   │   ├── FriendshipRepository.ts
│   │   ├── NotificationRepository.ts
│   │   └── BaseRepository.ts    # 基类
│   │
│   ├── services/                # 业务逻辑层 (BLL)
│   │   ├── auth/
│   │   │   ├── AuthService.ts
│   │   │   ├── TokenService.ts
│   │   │   └── PasswordService.ts
│   │   │
│   │   ├── user/
│   │   │   ├── UserService.ts
│   │   │   ├── ProfileService.ts
│   │   │   └── UserCacheService.ts
│   │   │
│   │   ├── message/
│   │   │   ├── MessageService.ts
│   │   │   ├── MessageQueueService.ts
│   │   │   └── SearchService.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── ConversationService.ts
│   │   │   └── PresenceService.ts
│   │   │
│   │   ├── group/
│   │   │   ├── GroupService.ts
│   │   │   ├── GroupMemberService.ts
│   │   │   └── GroupInviteService.ts
│   │   │
│   │   ├── friendship/
│   │   │   ├── FriendshipService.ts
│   │   │   └── BlockService.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── NotificationService.ts
│   │   │   └── PushService.ts
│   │   │
│   │   └── file/
│   │       └── FileService.ts
│   │
│   ├── controllers/             # 请求处理器 (Controller)
│   │   ├── auth/
│   │   │   └── AuthController.ts
│   │   │
│   │   ├── user/
│   │   │   └── UserController.ts
│   │   │
│   │   ├── message/
│   │   │   └── MessageController.ts
│   │   │
│   │   ├── chat/
│   │   │   └── ConversationController.ts
│   │   │
│   │   ├── group/
│   │   │   └── GroupController.ts
│   │   │
│   │   ├── friendship/
│   │   │   └── FriendshipController.ts
│   │   │
│   │   └── notification/
│   │       └── NotificationController.ts
│   │
│   ├── routes/                  # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── message.routes.ts
│   │   ├── conversation.routes.ts
│   │   ├── group.routes.ts
│   │   ├── friendship.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── file.routes.ts
│   │   └── index.ts             # 路由聚合
│   │
│   ├── middleware/              # Express中间件
│   │   ├── auth.middleware.ts   # JWT验证
│   │   ├── error.middleware.ts  # 错误处理
│   │   ├── logging.middleware.ts # 日志记录
│   │   ├── validation.middleware.ts # 数据验证
│   │   ├── rate-limit.middleware.ts # 限流
│   │   ├── cors.middleware.ts   # CORS
│   │   └── request-id.middleware.ts # 请求追踪
│   │
│   ├── sockets/                 # WebSocket处理
│   │   ├── handlers/
│   │   │   ├── chatHandler.ts
│   │   │   ├── presenceHandler.ts
│   │   │   ├── notificationHandler.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── namespaces/
│   │   │   ├── chatNamespace.ts
│   │   │   ├── presenceNamespace.ts
│   │   │   └── notificationNamespace.ts
│   │   │
│   │   ├── events/
│   │   │   ├── chatEvents.ts
│   │   │   ├── presenceEvents.ts
│   │   │   └── systemEvents.ts
│   │   │
│   │   └── manager.ts           # Socket连接管理
│   │
│   ├── jobs/                    # 定时任务
│   │   ├── cleanupExpiredTokens.ts
│   │   ├── archiveOldMessages.ts
│   │   ├── cleanupSessions.ts
│   │   └── index.ts
│   │
│   ├── events/                  # 事件总线
│   │   ├── EventBus.ts
│   │   ├── handlers/
│   │   │   ├── messageEventHandler.ts
│   │   │   ├── userEventHandler.ts
│   │   │   ├── groupEventHandler.ts
│   │   │   └── notificationEventHandler.ts
│   │   └── index.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── logger.ts            # 日志工具
│   │   ├── error.ts             # 错误处理
│   │   ├── response.ts          # 响应格式化
│   │   ├── validation.ts        # 数据验证
│   │   ├── crypto.ts            # 加密工具
│   │   ├── pagination.ts        # 分页工具
│   │   ├── date.ts              # 日期工具
│   │   └── cache.ts             # 缓存工具
│   │
│   ├── types/                   # TypeScript类型定义
│   │   ├── index.ts
│   │   ├── models.ts
│   │   ├── requests.ts
│   │   ├── responses.ts
│   │   ├── socket.ts
│   │   └── api.ts
│   │
│   ├── errors/                  # 自定义错误类
│   │   ├── AppError.ts
│   │   ├── ValidationError.ts
│   │   ├── AuthenticationError.ts
│   │   ├── AuthorizationError.ts
│   │   └── NotFoundError.ts
│   │
│   └── app.ts                   # Express应用配置
│       server.ts                # 服务器启动
│
├── tests/                       # 测试文件
│   ├── unit/                    # 单元测试
│   │   ├── services/
│   │   ├── utils/
│   │   └── models/
│   │
│   ├── integration/             # 集成测试
│   │   ├── auth.test.ts
│   │   ├── message.test.ts
│   │   ├── conversation.test.ts
│   │   └── group.test.ts
│   │
│   └── fixtures/                # 测试数据
│       ├── users.json
│       ├── messages.json
│       └── groups.json
│
├── migrations/                  # 数据库迁移 (如用Prisma/TypeORM)
│   ├── 001_create_users.sql
│   ├── 002_create_messages.sql
│   └── 003_create_groups.sql
│
├── docker/                      # Docker配置
│   ├── Dockerfile
│   └── .dockerignore
│
├── .env.example                 # 环境变量示例
├── .eslintrc.cjs                # ESLint配置
├── .prettierrc                  # Prettier配置
├── tsconfig.json                # TypeScript配置
├── package.json
├── docker-compose.yml           # Docker Compose配置
└── README.md
```

---

## 🐳 Docker与部署配置

### Docker Compose (本地开发)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: clawchat_postgres
    environment:
      POSTGRES_DB: clawchat
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB文档数据库
  mongodb:
    image: mongo:6.0
    container_name: clawchat_mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: mongodb_password_dev
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: clawchat_redis
    command: redis-server --requirepass redis_password_dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ消息队列
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: clawchat_rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch搜索引擎
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    container_name: clawchat_elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: curl -s http://localhost:9200 >/dev/null || exit 1
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: docker/Dockerfile
    container_name: clawchat_backend
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://postgres:postgres_password_dev@postgres:5432/clawchat
      MONGO_URL: mongodb://admin:mongodb_password_dev@mongodb:27017/clawchat
      REDIS_URL: redis://:redis_password_dev@redis:6379
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
      ELASTICSEARCH_URL: http://elasticsearch:9200
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    command: npm run dev

  # 前端服务 (可选，用于开发)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: clawchat_frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
  rabbitmq_data:
  elasticsearch_data:

networks:
  default:
    name: clawchat_network
```

### 后端 Dockerfile

```dockerfile
# Dockerfile (backend)

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源码
COPY . .

# 构建TypeScript
RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 启动应用
CMD ["node", "dist/server.js"]
```

### 前端 Dockerfile

```dockerfile
# Dockerfile (frontend)

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 安装serve用于提供静态文件
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
```

---

## 🚀 部署配置

### Kubernetes 部署 (生产环境)

```yaml
# k8s/deployment-backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clawchat-backend
  namespace: clawchat
spec:
  replicas: 3
  selector:
    matchLabels:
      app: clawchat-backend
  template:
    metadata:
      labels:
        app: clawchat-backend
    spec:
      containers:
      - name: backend
        image: clawchat/backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: clawchat-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: clawchat-secrets
              key: redis-url
        
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: clawchat-backend-service
  namespace: clawchat
spec:
  selector:
    app: clawchat-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## 📋 环境变量配置

### 后端 .env.example

```bash
# 应用配置
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/clawchat
MONGO_URL=mongodb://admin:password@localhost:27017/clawchat

# 缓存配置
REDIS_URL=redis://:password@localhost:6379/0

# 消息队列配置
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# 搜索引擎
ELASTICSEARCH_URL=http://localhost:9200

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE_IN=7d

# 文件存储 (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=clawchat-files

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@clawchat.com

# 日志
LOG_LEVEL=debug
LOG_DIR=./logs

# 限流
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Socket.IO
SOCKET_PING_TIMEOUT=25000
SOCKET_PING_INTERVAL=25000
```

### 前端 .env.example

```bash
# API配置
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# 应用配置
VITE_APP_NAME=ClawChat
VITE_APP_VERSION=1.0.0

# 特性开关
VITE_ENABLE_E2E_ENCRYPTION=false
VITE_ENABLE_VOICE_CALL=false
VITE_ENABLE_VIDEO_CALL=false

# 第三方服务
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

---

## 🔄 CI/CD 流程

### GitHub Actions 工作流

```yaml
# .github/workflows/build-deploy.yml
name: Build & Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test
    
    - name: Run coverage
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: clawchat/backend:latest,clawchat/backend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to K8s
      run: |
        kubectl set image deployment/clawchat-backend \
          backend=clawchat/backend:${{ github.sha }} \
          -n clawchat
```

---

## 📊 监控与告警

### Prometheus监控配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093

rule_files:
  - "rules.yml"

scrape_configs:
  - job_name: 'clawchat-backend'
    static_configs:
      - targets: ['localhost:3000']
```

### Grafana 仪表板

常用指标:
- HTTP请求延迟 (p50, p95, p99)
- 错误率
- 吞吐量 (RPS)
- 数据库连接数
- Redis内存使用
- WebSocket连接数
- 消息处理延迟

---

## ✅ 部署检查清单

```
前置条件:
  ☐ 域名申请与DNS配置
  ☐ SSL证书申请 (Let's Encrypt)
  ☐ CDN配置
  ☐ 云服务商账户 (AWS/阿里云)
  ☐ 监控告警系统

应用部署:
  ☐ 构建Docker镜像
  ☐ 推送到镜像仓库
  ☐ 部署K8s集群
  ☐ 配置负载均衡
  ☐ 配置自动扩容

数据库:
  ☐ PostgreSQL备份策略
  ☐ MongoDB复制集配置
  ☐ 数据库备份测试
  ☐ 灾难恢复计划

缓存与队列:
  ☐ Redis哨兵配置
  ☐ RabbitMQ集群配置
  ☐ 消息队列监控

安全:
  ☐ SSL/TLS配置
  ☐ WAF规则配置
  ☐ API密钥管理
  ☐ 审计日志启用
  ☐ 定期安全扫描

性能:
  ☐ CDN缓存策略
  ☐ 数据库慢查询日志
  ☐ 应用性能监控
  ☐ 压力测试通过

监控告警:
  ☐ Prometheus配置
  ☐ Grafana仪表板
  ☐ 告警规则配置
  ☐ 通知渠道配置

灾难恢复:
  ☐ RTO目标 (< 1小时)
  ☐ RPO目标 (< 5分钟)
  ☐ 故障转移测试
  ☐ 备份恢复测试
```

---

这份完整的技术栈与部署指南已经可以直接用于生产环境的部署。
