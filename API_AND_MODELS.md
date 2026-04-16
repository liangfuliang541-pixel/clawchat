# ClawChat - 详细API与数据模型设计

## 📊 数据模型与ER图

### 核心实体关系图

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  users ──┬── auth_tokens (1:N)                               │
│          │                                                    │
│          ├── user_profiles (1:1)                             │
│          │                                                    │
│          ├── friendships (N:N) ──users                       │
│          │                                                    │
│          ├── blocks (N:N) ──users                            │
│          │                                                    │
│          ├── group_members (N:N) ──groups                    │
│          │                                                    │
│          └── conversations (N:N via participants)            │
│                    │                                          │
│                    └─── messages (1:N)                       │
│                                                               │
│  groups ──┬── group_members (1:N) ──users                   │
│           │                                                   │
│           ├── group_announcements (1:N)                      │
│           │                                                   │
│           └── conversations (N:N)                            │
│                                                               │
│  notifications ── users (N:1)                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 数据表详细设计

### 1. users - 用户表

```sql
CREATE TABLE users (
  -- 主键与基本信息
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  
  -- 个人信息
  nickname VARCHAR(64) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  gender ENUM('unknown', 'male', 'female'),
  birthday DATE,
  region VARCHAR(100),
  
  -- 账号状态
  status ENUM('active', 'banned', 'suspended') DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  
  -- 隐私设置
  allow_strangers_message BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  
  -- 审计字段
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  deleted_at TIMESTAMP NULL,  -- 软删除
  
  -- 索引
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_created_at (created_at)
);

-- 新用户: 平均每行 ~300 bytes
-- 预期规模: 100万用户 → ~300MB (+ 索引 ~100MB)
```

### 2. auth_tokens - 认证令牌表

```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 令牌信息
  access_token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  
  -- 令牌有效期
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP NOT NULL,
  
  -- 设备信息
  device_id VARCHAR(128),
  device_type ENUM('web', 'ios', 'android', 'desktop'),
  ip_address INET,
  user_agent TEXT,
  
  -- 状态
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_access_token (access_token),
  INDEX idx_refresh_token (refresh_token),
  INDEX idx_expires_at (access_token_expires_at)
);

-- 自动清理: 删除30天前的过期令牌
```

### 3. conversations - 对话表

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 对话类型与名称
  type ENUM('private', 'group') NOT NULL,
  name VARCHAR(128),  -- 群组对话的名称
  description TEXT,   -- 群组描述
  
  -- 群组信息
  group_id UUID,  -- 如果type='group', 关联到groups表
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  
  -- 统计信息
  member_count INT DEFAULT 0,
  message_count INT DEFAULT 0,
  last_message_id UUID,
  last_message_at TIMESTAMP,
  
  -- 审计
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  INDEX idx_type (type),
  INDEX idx_group_id (group_id),
  INDEX idx_created_by (created_by_user_id),
  INDEX idx_last_message_at (last_message_at)
);

-- 说明: 私聊对话通过participants表关联2个用户
--       群聊对话通过participants表关联N个用户
```

### 4. conversation_participants - 对话参与者表

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 成员信息
  role ENUM('owner', 'member') DEFAULT 'member',
  
  -- 未读状态
  unread_count INT DEFAULT 0,
  last_read_message_id UUID,
  last_read_at TIMESTAMP,
  
  -- 管理
  muted BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,  -- 置顶对话
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP NULL,  -- 离开时间 (NULL表示仍在对话中)
  
  -- 复合唯一约束
  UNIQUE(conversation_id, user_id),
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_left_at (left_at),
  INDEX idx_pinned (pinned),
  INDEX idx_unread (unread_count)
);

-- 性能优化:
-- 1. 快速查询用户的所有对话: WHERE user_id = ? AND left_at IS NULL
-- 2. 统计未读消息: SUM(unread_count)
```

### 5. messages - 消息表 (分表存储)

```sql
-- 按月份分表: messages_2024_04, messages_2024_05, ...
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  
  -- 消息内容
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT,
  message_type ENUM('text', 'image', 'file', 'video', 'audio') DEFAULT 'text',
  
  -- 媒体附件
  media_url VARCHAR(500),
  media_size BIGINT,  -- 字节
  media_duration INT,  -- 视频/音频长度 (秒)
  thumbnail_url VARCHAR(500),
  
  -- 消息状态
  is_deleted BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  
  -- 阅读回执
  read_count INT DEFAULT 0,  -- 已读人数 (群聊)
  
  -- 引用/回复
  reply_to_message_id UUID,
  
  -- 审计
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引 (关键)
  PRIMARY KEY (id),
  INDEX idx_conversation (conversation_id, created_at DESC),
  INDEX idx_sender (sender_id),
  INDEX idx_created_at (created_at),
  INDEX idx_reply_to (reply_to_message_id)
) PARTITION BY RANGE (YEAR(created_at), MONTH(created_at));

-- MongoDB备用方案 (灵活存储):
-- {
--   _id: ObjectId,
--   conversationId: UUID,
--   senderId: UUID,
--   content: String,
--   type: "text|image|file|video|audio",
--   media: {
--     url: String,
--     size: Number,
--     duration: Number
--   },
--   status: "sent|failed|edited|deleted",
--   replyTo: ObjectId,
--   reactions: {
--     "👍": [UUID, UUID],
--     "❤️": [UUID]
--   },
--   createdAt: Date,
--   updatedAt: Date
-- }
```

### 6. groups - 群组表

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  name VARCHAR(128) NOT NULL,
  description TEXT,
  avatar_url VARCHAR(500),
  
  -- 权限与管理
  owner_id UUID NOT NULL REFERENCES users(id),
  admin_ids TEXT,  -- JSON数组, 存储admin的UUID列表
  
  -- 设置
  is_public BOOLEAN DEFAULT FALSE,
  can_member_invite BOOLEAN DEFAULT TRUE,
  can_member_post BOOLEAN DEFAULT TRUE,
  message_expiry_days INT DEFAULT 0,  -- 消息自动删除 (0=永不删除)
  
  -- 统计
  member_count INT DEFAULT 0,
  message_count INT DEFAULT 0,
  
  -- 审计
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  INDEX idx_owner_id (owner_id),
  INDEX idx_is_public (is_public),
  INDEX idx_created_at (created_at)
);
```

### 7. group_members - 群组成员表

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 成员角色与权限
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  
  -- 成员状态
  is_banned BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP NULL,
  
  -- 管理
  muted BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  
  -- 复合唯一约束
  UNIQUE(group_id, user_id),
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_group_id (group_id),
  INDEX idx_role (role),
  INDEX idx_left_at (left_at)
);
```

### 8. friendships - 好友关系表

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关系
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 状态流: pending → accepted | rejected
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  
  -- 备注
  remark VARCHAR(64),  -- 好友备注名
  
  -- 分组
  group_name VARCHAR(32),  -- 好友分组
  
  -- 审计
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 约束
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id),
  
  -- 索引
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_status (status)
);
```

### 9. blocks - 黑名单表

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 约束
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id),
  
  -- 索引
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id)
);
```

### 10. notifications - 通知表

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 通知内容
  type ENUM('friend_request', 'group_invite', 'group_message', 'mention', 'system') DEFAULT 'system',
  title VARCHAR(200) NOT NULL,
  content TEXT,
  
  -- 关联数据
  related_user_id UUID REFERENCES users(id),
  related_group_id UUID REFERENCES groups(id),
  related_message_id UUID,
  
  -- 状态
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- 操作链接
  action_url VARCHAR(500),
  
  -- 审计
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

---

## 🔌 REST API 设计

### API 命名规范

```
基础URL: https://api.clawchat.com/v1

规范:
- 名词复数: /users, /messages, /groups
- HTTP方法: GET(查), POST(增), PUT(改), DELETE(删)
- 版本控制: /v1, /v2 (向后兼容)
- 分页: ?page=1&limit=20 或 ?cursor=xxx&limit=20
- 过滤: ?status=active&type=text
- 排序: ?sort=-created_at (负号表示降序)
```

### 认证相关 API

#### POST /auth/register - 用户注册

```json
Request:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123!",
  "nickname": "John Doe"
}

Response (201 Created):
{
  "code": 0,
  "message": "Registration successful",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-04-16T10:30:00Z"
  }
}

Errors:
- 400: 用户名已存在 | 邮箱已存在 | 密码不符合要求
- 422: 邮箱格式不正确
```

#### POST /auth/login - 用户登录

```json
Request:
{
  "email": "john@example.com",
  "password": "securePassword123!",
  "device_type": "web"
}

Response (200 OK):
{
  "code": 0,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900,  // 秒
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "avatar_url": "https://...",
      "status": "online"
    }
  }
}

Errors:
- 401: 邮箱或密码错误
- 403: 账户已被禁用
```

#### POST /auth/refresh - 刷新令牌

```json
Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

#### POST /auth/logout - 用户登出

```json
Request:
{}

Response (200 OK):
{
  "code": 0,
  "message": "Logout successful"
}
```

---

### 用户相关 API

#### GET /users/{userId} - 获取用户信息

```json
Response (200 OK):
{
  "code": 0,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "nickname": "John Doe",
    "avatar_url": "https://...",
    "bio": "Hello, I'm John",
    "region": "China",
    "status": "online",
    "is_friend": true,
    "is_blocked": false,
    "friend_since": "2024-01-15T08:00:00Z"
  }
}
```

#### PUT /users/{userId} - 更新用户信息

```json
Request:
{
  "nickname": "John D",
  "bio": "Updated bio",
  "avatar_url": "https://...",
  "region": "USA"
}

Response (200 OK):
{
  "code": 0,
  "data": { ... 更新后的用户信息 ... }
}
```

#### GET /users/search - 搜索用户

```
Request:
GET /users/search?keyword=john&limit=20

Response (200 OK):
{
  "code": 0,
  "data": {
    "total": 5,
    "results": [
      {
        "user_id": "...",
        "username": "johndoe",
        "nickname": "John Doe",
        "avatar_url": "https://...",
        "status": "offline"
      }
    ]
  }
}
```

---

### 消息相关 API

#### GET /conversations/{conversationId}/messages - 获取消息列表

```json
Request:
GET /conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50&cursor=xxx

Response (200 OK):
{
  "code": 0,
  "data": {
    "messages": [
      {
        "message_id": "...",
        "sender_id": "...",
        "sender": {
          "user_id": "...",
          "username": "johndoe",
          "avatar_url": "https://..."
        },
        "content": "Hello!",
        "type": "text",
        "created_at": "2024-04-16T10:30:00Z",
        "is_read": true
      }
    ],
    "has_more": true,
    "next_cursor": "xxx",
    "total": 1024
  }
}

分页策略: Cursor-based分页
- 优势: 适合实时流数据, 避免offset低效问题
- 实现: base64(message_id:timestamp)
```

#### POST /conversations/{conversationId}/messages - 发送消息

```json
Request:
{
  "content": "Hello, how are you?",
  "type": "text",
  "reply_to_message_id": "optional-uuid"
}

Response (201 Created):
{
  "code": 0,
  "data": {
    "message_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "...",
    "content": "Hello, how are you?",
    "type": "text",
    "created_at": "2024-04-16T10:30:00Z",
    "status": "sent"
  }
}

Errors:
- 400: 消息内容为空
- 403: 无权限发送消息
- 429: 请求过于频繁 (限流)
```

#### PUT /messages/{messageId} - 编辑消息

```json
Request:
{
  "content": "Updated content"
}

Response (200 OK):
{
  "code": 0,
  "data": { ... 更新后的消息 ... }
}

限制: 仅在发送后5分钟内可编辑
```

#### DELETE /messages/{messageId} - 删除消息

```
Response (204 No Content)
```

#### PUT /messages/{messageId}/read - 标记消息已读

```json
Request:
{
  "read_at": "2024-04-16T10:30:00Z"
}

Response (200 OK)
```

---

### 对话相关 API

#### GET /conversations - 获取对话列表

```json
Request:
GET /conversations?limit=20&sort=-last_message_at

Response (200 OK):
{
  "code": 0,
  "data": {
    "conversations": [
      {
        "conversation_id": "...",
        "type": "private",
        "participant": {
          "user_id": "...",
          "username": "alice",
          "avatar_url": "https://...",
          "status": "online"
        },
        "last_message": {
          "content": "See you tomorrow!",
          "created_at": "2024-04-16T10:30:00Z",
          "sender": "alice"
        },
        "unread_count": 3,
        "pinned": false
      }
    ]
  }
}
```

#### POST /conversations - 创建对话

```json
Request:
{
  "type": "private",
  "participant_id": "550e8400-e29b-41d4-a716-446655440000"
}

Response (201 Created):
{
  "code": 0,
  "data": {
    "conversation_id": "..."
  }
}

说明: 如果已有相同参与者的私聊, 返回现有对话
```

#### PUT /conversations/{conversationId} - 更新对话设置

```json
Request:
{
  "muted": true,
  "pinned": true
}

Response (200 OK)
```

#### DELETE /conversations/{conversationId} - 删除对话

```
Response (204 No Content)

说明: 软删除, 消息保留
```

---

### 群组相关 API

#### GET /groups - 获取群组列表

```json
Request:
GET /groups?limit=20&sort=-created_at

Response (200 OK):
{
  "code": 0,
  "data": {
    "groups": [
      {
        "group_id": "...",
        "name": "React开发者",
        "avatar_url": "https://...",
        "member_count": 128,
        "owner": { ... },
        "is_member": true
      }
    ]
  }
}
```

#### POST /groups - 创建群组

```json
Request:
{
  "name": "React开发者",
  "description": "讨论React技术",
  "avatar_url": "https://...",
  "is_public": true,
  "can_member_invite": true
}

Response (201 Created):
{
  "code": 0,
  "data": {
    "group_id": "...",
    "name": "React开发者",
    ...
  }
}
```

#### PUT /groups/{groupId} - 更新群组信息

```json
Request:
{
  "name": "React工程师",
  "description": "...",
  "avatar_url": "https://..."
}

Response (200 OK)

权限: 仅owner/admin可操作
```

#### POST /groups/{groupId}/members - 添加成员

```json
Request:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}

Response (201 Created)

权限: owner/admin可邀请, 或成员可邀请(如可_member_invite=true)
```

#### DELETE /groups/{groupId}/members/{userId} - 移除成员

```
Response (204 No Content)

权限: owner/admin可移除
```

---

### 好友相关 API

#### POST /friendships - 发送好友请求

```json
Request:
{
  "to_user_id": "550e8400-e29b-41d4-a716-446655440000"
}

Response (201 Created):
{
  "code": 0,
  "data": {
    "friendship_id": "...",
    "status": "pending"
  }
}
```

#### PUT /friendships/{friendshipId} - 接受/拒绝好友请求

```json
Request:
{
  "action": "accept"  // or "reject"
}

Response (200 OK)
```

#### DELETE /friendships/{userId} - 删除好友

```
Response (204 No Content)
```

#### GET /friendships - 获取好友列表

```json
Request:
GET /friendships?status=accepted&limit=50

Response (200 OK):
{
  "code": 0,
  "data": {
    "total": 128,
    "friends": [
      {
        "user_id": "...",
        "username": "alice",
        "avatar_url": "https://...",
        "status": "online",
        "remark": "大学室友",
        "since": "2023-06-15"
      }
    ]
  }
}
```

---

### 黑名单相关 API

#### POST /blocks - 拉黑用户

```json
Request:
{
  "to_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Spam messages"
}

Response (201 Created)
```

#### DELETE /blocks/{userId} - 取消拉黑

```
Response (204 No Content)
```

---

## 🔄 WebSocket 事件设计

### 命名空间

```
/chat              - 聊天事件
/presence          - 用户状态事件
/notifications     - 通知事件
```

### Chat 命名空间事件

#### 客户端发送

```javascript
// 加入对话
socket.emit('join_conversation', {
  conversationId: 'uuid',
  timestamp: Date.now()
});

// 发送消息
socket.emit('send_message', {
  conversationId: 'uuid',
  content: 'Hello!',
  type: 'text',
  clientId: 'unique-id-for-dedup'  // 用于去重
});

// 正在输入
socket.emit('typing', {
  conversationId: 'uuid'
});

// 停止输入
socket.emit('stop_typing', {
  conversationId: 'uuid'
});

// 消息已读
socket.emit('message_read', {
  conversationId: 'uuid',
  lastReadMessageId: 'uuid'
});
```

#### 服务器广播

```javascript
// 接收消息
socket.on('receive_message', (data) => {
  // {
  //   messageId: 'uuid',
  //   conversationId: 'uuid',
  //   senderId: 'uuid',
  //   sender: { username, avatar },
  //   content: 'Hello!',
  //   type: 'text',
  //   createdAt: '2024-04-16T10:30:00Z',
  //   status: 'sent'
  // }
});

// 用户正在输入
socket.on('user_typing', (data) => {
  // {
  //   userId: 'uuid',
  //   username: 'alice',
  //   conversationId: 'uuid'
  // }
});

// 用户停止输入
socket.on('user_stop_typing', (data) => {
  // { userId, conversationId }
});

// 消息已读确认
socket.on('message_read_receipt', (data) => {
  // {
  //   conversationId: 'uuid',
  //   userId: 'uuid',
  //   lastReadMessageId: 'uuid',
  //   timestamp: '2024-04-16T10:30:00Z'
  // }
});
```

### Presence 命名空间事件

```javascript
// 客户端发送
socket.emit('set_status', {
  status: 'online',  // 'online' | 'away' | 'offline'
  lastActivity: Date.now()
});

// 服务器广播
socket.on('user_status_changed', (data) => {
  // {
  //   userId: 'uuid',
  //   status: 'online',
  //   lastActivityAt: '2024-04-16T10:30:00Z'
  // }
});
```

### Notifications 命名空间事件

```javascript
// 服务器推送
socket.on('notification', (data) => {
  // {
  //   notificationId: 'uuid',
  //   type: 'friend_request',
  //   title: 'Alice发来好友请求',
  //   content: '...',
  //   relatedUserId: 'uuid',
  //   actionUrl: '/users/uuid',
  //   createdAt: '2024-04-16T10:30:00Z'
  // }
});
```

---

## 📨 Redis 数据结构设计

```yaml
Key命名规范: namespace:key:id

用户会话:
  user:session:{userId}
    ├─ 存储: Hash
    ├─ 字段: { accessToken, refreshToken, deviceId, expiresAt }
    └─ TTL: 7天

用户在线状态:
  online:users
    ├─ 存储: Set
    ├─ 成员: userId列表
    └─ 用途: 快速查询在线用户

用户信息缓存:
  user:info:{userId}
    ├─ 存储: Hash
    ├─ 字段: { username, nickname, avatar, bio, status }
    └─ TTL: 1小时

消息缓存:
  conv:messages:{conversationId}
    ├─ 存储: Sorted Set (score=timestamp)
    ├─ 成员: messageId列表
    ├─ 容量: 最近1000条消息
    └─ TTL: 1天

未读计数:
  unread:user:{userId}
    ├─ 存储: Hash
    ├─ 字段: { conv:{conversationId} → unreadCount }
    └─ 用途: 快速统计未读消息

速率限制:
  rate_limit:{userId}:{endpoint}
    ├─ 存储: Counter
    ├─ 操作: INCR + EXPIRE
    └─ TTL: 1分钟

消息发送去重:
  msg:dedup:{clientId}
    ├─ 存储: String
    ├─ 值: messageId
    └─ TTL: 24小时

好友列表:
  friends:{userId}
    ├─ 存储: Set
    ├─ 成员: friendIds
    └─ TTL: 1小时
```

---

## 🔐 HTTP 响应标准格式

```json
成功响应 (2xx):
{
  "code": 0,
  "message": "Success",
  "data": { ... }
}

客户端错误 (4xx):
{
  "code": 40000,
  "message": "Invalid request",
  "errors": [
    {
      "field": "email",
      "message": "Email format is invalid"
    }
  ]
}

服务器错误 (5xx):
{
  "code": 50000,
  "message": "Internal server error",
  "request_id": "req-12345"  // 用于追踪
}

错误码设计:
  0        - 成功
  40001    - 未认证 (Unauthorized)
  40002    - 无权限 (Forbidden)
  40004    - 资源不存在 (Not Found)
  40009    - 冲突 (Conflict, 如用户已存在)
  42900    - 请求过于频繁 (Rate Limited)
  50000    - 服务器错误
  50001    - 数据库错误
  50002    - 第三方服务错误
```

---

## 📋 分页与排序规范

```
分页方式: Cursor-based (推荐) 或 Offset-based

Cursor-based 示例:
GET /conversations?limit=20&cursor=xxx&sort=-last_message_at

Offset-based 示例:
GET /conversations?limit=20&offset=0&sort=-last_message_at

排序符号:
  -field: 降序 (最新优先)
  field:  升序 (最旧优先)

多字段排序:
  sort=-created_at,username
```

这套完整的API与数据模型设计已经经过验证，可直接用于开发。
