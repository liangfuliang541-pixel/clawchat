# ClawChat - 开发规范与最佳实践

## 🎯 核心开发原则

```
1. 代码即文档 (Code as Documentation)
   - 变量名清晰表达意图
   - 复杂逻辑添加注释
   - 公共API添加JSDoc

2. SOLID原则
   - Single Responsibility (单一职责)
   - Open/Closed (开闭原则)
   - Liskov Substitution (里氏替换)
   - Interface Segregation (接口隔离)
   - Dependency Inversion (依赖倒置)

3. DRY (Don't Repeat Yourself)
   - 避免代码重复
   - 提取公共逻辑
   - 创建可复用组件

4. KISS (Keep It Simple, Stupid)
   - 优先简单实现
   - 避免过度设计
   - 复杂性必须证明其必要性

5. 可测试性优先
   - 单元测试覆盖 > 80%
   - 集成测试覆盖核心流程
   - 端到端测试覆盖关键场景
```

---

## 🏗️ 后端开发规范

### 1. TypeScript 代码规范

#### 严格的类型定义

```typescript
// ✅ 好的做法: 显式类型，完整的泛型
interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function createUser(req: UserCreateRequest): Promise<ApiResponse<User>> {
  // 实现
}

// ❌ 避免: any类型
async function createUser(req: any): Promise<any> {
  // 实现
}
```

#### 使用Union Types代替Magic Strings

```typescript
// ✅ 好的做法
type UserStatus = 'active' | 'banned' | 'suspended';
type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio';

interface User {
  id: string;
  status: UserStatus;
}

// ❌ 避免
interface User {
  id: string;
  status: string;  // 容易出错
}
```

#### 使用Enum定义常量

```typescript
// ✅ 好的做法
enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

enum ErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  RATE_LIMITED = 429,
  INTERNAL_ERROR = 500,
}

// 使用
if (user.role === UserRole.ADMIN) {
  // ...
}
```

### 2. 项目分层架构

```typescript
// 1. Controller层: 处理HTTP请求
// src/controllers/user.controller.ts
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  async createUser(@Body() req: CreateUserDto): Promise<ApiResponse<User>> {
    const user = await this.userService.create(req);
    return {
      code: 0,
      message: 'User created successfully',
      data: user
    };
  }
}

// 2. Service层: 业务逻辑
// src/services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private cacheService: CacheService
  ) {}

  async create(req: CreateUserDto): Promise<User> {
    // 验证
    await this.validateUsername(req.username);
    
    // 加密密码
    const hashedPassword = await this.passwordService.hash(req.password);
    
    // 保存
    const user = await this.userRepository.create({
      ...req,
      password: hashedPassword
    });
    
    // 缓存
    await this.cacheService.set(`user:${user.id}`, user, 3600);
    
    return user;
  }
}

// 3. Repository层: 数据访问
// src/repositories/user.repository.ts
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private db: DatabaseConnection) {
    super(db, 'users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.query()
      .where('email', email)
      .first();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.query()
      .where('username', username)
      .first();
  }
}

// 4. Model层: 数据模型
// src/models/user.model.ts
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 5. DTO层: 数据传输对象
// src/dto/user.dto.ts
export class CreateUserDto {
  @IsString()
  @Length(3, 32)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### 3. 错误处理

```typescript
// 自定义错误类
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: number,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(public details: Record<string, string>) {
    super(400, 'Validation failed', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// 使用示例
async function getUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
}

// 全局错误处理中间件
// src/middleware/error.middleware.ts
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
      requestId: req.id
    });
  }

  logger.error('Unhandled error', { error: err, requestId: req.id });
  
  return res.status(500).json({
    code: 50000,
    message: 'Internal server error',
    requestId: req.id
  });
};
```

### 4. 日志记录规范

```typescript
// ✅ 好的日志实践
import logger from './logger';

async function processMessage(messageId: string) {
  logger.info('Processing message', { messageId });
  
  try {
    const message = await messageRepository.findById(messageId);
    logger.debug('Message found', { message: { id: message.id, senderId: message.senderId } });
    
    const result = await messageService.process(message);
    logger.info('Message processed successfully', { 
      messageId, 
      processingTime: Date.now() - startTime 
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to process message', {
      messageId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// 日志级别
logger.debug('Detailed debugging information');       // 开发
logger.info('Informational messages');               // 一般信息
logger.warn('Warning messages');                     // 警告
logger.error('Error messages');                      // 错误
logger.fatal('Critical system failures');            // 致命错误
```

### 5. 异步处理规范

```typescript
// ✅ 使用 async/await
async function sendMessageToUser(userId: string, message: string) {
  try {
    const user = await userRepository.findById(userId);
    await notificationService.send(user.id, message);
    logger.info('Message sent', { userId });
  } catch (error) {
    logger.error('Failed to send message', { userId, error });
    throw error;
  }
}

// ✅ 使用 Promise.all 并发处理
async function notifyGroup(groupId: string, message: string) {
  const members = await groupRepository.findMembers(groupId);
  
  // 并发发送，而不是顺序发送
  await Promise.all(
    members.map(member => 
      notificationService.send(member.userId, message)
    )
  );
}

// ✅ 使用 Promise.allSettled 处理部分失败
async function batchDeleteMessages(messageIds: string[]) {
  const results = await Promise.allSettled(
    messageIds.map(id => messageRepository.delete(id))
  );
  
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    logger.warn('Some messages failed to delete', { failures });
  }
}

// ❌ 避免回调地狱
function sendMessageCallback(userId: string, message: string) {
  userRepository.findById(userId, (err, user) => {
    if (err) {
      handleError(err);
    } else {
      notificationService.send(user.id, message, (err) => {
        if (err) {
          handleError(err);
        } else {
          logger.info('Message sent');
        }
      });
    }
  });
}
```

### 6. 缓存策略

```typescript
// ✅ 缓存与缓存穿透保护
async function getUserWithCache(userId: string): Promise<User> {
  const cacheKey = `user:${userId}`;
  
  // 1. 先查缓存
  const cached = await cacheService.get<User>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 2. 缓存未命中，查数据库
  const user = await userRepository.findById(userId);
  
  // 3. 处理缓存穿透（数据库中不存在）
  if (!user) {
    // 设置空值缓存，避免频繁查询
    await cacheService.set(cacheKey, null, 300); // 5分钟
    throw new NotFoundError('User');
  }
  
  // 4. 更新缓存
  await cacheService.set(cacheKey, user, 3600); // 1小时
  
  return user;
}

// ✅ 缓存失效策略
async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  // 1. 更新数据库
  const updated = await userRepository.update(userId, data);
  
  // 2. 清理缓存 (cache-aside)
  await cacheService.delete(`user:${userId}`);
  
  // 3. 发布事件通知其他服务
  eventBus.emit('user.updated', { userId, data });
  
  return updated;
}

// ✅ 使用缓存预热
async function warmupCache() {
  logger.info('Starting cache warmup');
  
  // 预热热点数据
  const hotUsers = await userRepository.findMostActive(1000);
  
  await Promise.all(
    hotUsers.map(user =>
      cacheService.set(`user:${user.id}`, user, 3600)
    )
  );
  
  logger.info('Cache warmup completed', { count: hotUsers.length });
}
```

### 7. 数据验证

```typescript
// ✅ 使用装饰器验证
import { IsString, IsEmail, MinLength, validate } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// 验证中间件
export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = Object.assign(new dtoClass(), req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      const details = errors.reduce((acc, error) => {
        acc[error.property] = Object.values(error.constraints || {});
        return acc;
      }, {} as Record<string, any>);
      
      throw new ValidationError(details);
    }
    
    next();
  };
};

// 在路由中使用
router.post('/users', validateDto(CreateUserDto), userController.create);
```

---

## 🎨 前端开发规范

### 1. React 组件规范

```typescript
// ✅ 函数组件与Hooks
interface ChatWindowProps {
  conversationId: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadMessages();
  }, [conversationId]);
  
  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Skeleton />;
  }
  
  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <InputBox onSend={handleSend} />
    </div>
  );
};

// ❌ 避免: 类组件（除非特殊情况）
class ChatWindow extends React.Component {
  // ...
}
```

### 2. 自定义Hooks

```typescript
// ✅ 自定义Hook提取逻辑
export const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);
  
  const sendMessage = useCallback(async (content: string) => {
    try {
      const message = await messageService.send(conversationId, content);
      setMessages(prev => [...prev, message]);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [conversationId]);
  
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);
  
  return { messages, loading, error, sendMessage, reload: loadMessages };
};

// 使用
function ChatPage({ conversationId }: ChatPageProps) {
  const { messages, loading, error, sendMessage } = useChat(conversationId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorBoundary error={error} />;
  
  return <ChatWindow messages={messages} onSend={sendMessage} />;
}
```

### 3. 状态管理 (Zustand)

```typescript
// ✅ 使用Zustand创建轻量级状态
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

interface ChatStore {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>()(
  immer((set) => ({
    messages: [],
    loading: false,
    error: null,
    
    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);
      }),
    
    removeMessage: (messageId) =>
      set((state) => {
        state.messages = state.messages.filter(m => m.id !== messageId);
      }),
    
    setLoading: (loading) =>
      set({ loading }),
    
    setError: (error) =>
      set({ error }),
    
    clearMessages: () =>
      set({ messages: [] }),
  }))
);

// 使用
function MessageList() {
  const messages = useChatStore(state => state.messages);
  const loading = useChatStore(state => state.loading);
  
  return (
    <div>
      {loading && <Spinner />}
      {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
    </div>
  );
}
```

### 4. TypeScript类型定义

```typescript
// ✅ 完整的类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  createdAt: Date;
  isRead: boolean;
}

// ✅ 使用Union Types
type NotificationType = 'friend_request' | 'group_invite' | 'message' | 'system';

// ✅ 使用Generics提高复用性
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 5. 条件渲染最佳实践

```typescript
// ❌ 避免: 三元操作符嵌套
function ChatList() {
  return (
    <div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Error message={error.message} />
      ) : messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : (
        <Empty />
      )}
    </div>
  );
}

// ✅ 好的做法: 分离条件
function ChatList() {
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (messages.length === 0) return <Empty />;
  return <MessageList messages={messages} />;
}

// ✅ 使用&& 操作符
function Notification() {
  return <div>{unreadCount > 0 && <Badge count={unreadCount} />}</div>;
}
```

### 6. 性能优化

```typescript
// ✅ 使用React.memo防止不必要重新渲染
interface MessageItemProps {
  message: Message;
  onDelete: (id: string) => void;
}

export const MessageItem = React.memo<MessageItemProps>(
  ({ message, onDelete }) => (
    <div>
      <p>{message.content}</p>
      <button onClick={() => onDelete(message.id)}>Delete</button>
    </div>
  )
);

// ✅ 使用useCallback缓存函数
function MessageList({ messages }: { messages: Message[] }) {
  const handleDelete = useCallback((messageId: string) => {
    messageService.delete(messageId);
  }, []);
  
  return (
    <div>
      {messages.map(msg => (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// ✅ 使用useMemo缓存计算结果
function UserStats({ users }: { users: User[] }) {
  const stats = useMemo(() => {
    return {
      total: users.length,
      online: users.filter(u => u.status === 'online').length,
      offline: users.filter(u => u.status === 'offline').length,
    };
  }, [users]);
  
  return <div>Total: {stats.total}, Online: {stats.online}</div>;
}
```

---

## 🧪 测试规范

### 后端测试

```typescript
// 单元测试
describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockUserRepository;
  let passwordService: MockPasswordService;
  
  beforeEach(() => {
    userRepository = new MockUserRepository();
    passwordService = new MockPasswordService();
    userService = new UserService(userRepository, passwordService);
  });
  
  describe('create', () => {
    it('should create user with hashed password', async () => {
      const req: CreateUserDto = {
        username: 'john',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const result = await userService.create(req);
      
      expect(result.username).toBe('john');
      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalled();
    });
    
    it('should throw error if username already exists', async () => {
      userRepository.findByUsername.mockResolvedValueOnce(existingUser);
      
      await expect(userService.create(req)).rejects.toThrow(ConflictError);
    });
  });
});

// 集成测试
describe('User API', () => {
  it('POST /users should create user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'john',
        email: 'john@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.code).toBe(0);
  });
});
```

### 前端测试

```typescript
// React组件测试
describe('ChatWindow', () => {
  it('should display messages', async () => {
    const messages = [
      { id: '1', content: 'Hello', senderId: 'user1', createdAt: new Date() }
    ];
    
    const { getByText } = render(
      <ChatWindow conversationId="conv1" messages={messages} />
    );
    
    expect(getByText('Hello')).toBeInTheDocument();
  });
  
  it('should send message on submit', async () => {
    const onSend = jest.fn();
    const { getByRole } = render(
      <InputBox onSend={onSend} />
    );
    
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(getByRole('button', { name: /send/i }));
    
    expect(onSend).toHaveBeenCalledWith('Test message');
  });
});
```

---

## 🔍 代码审查检查清单

```
通用检查:
  ☐ 代码是否遵循命名规范
  ☐ 是否有必要的注释和文档
  ☐ 是否有适当的错误处理
  ☐ 是否避免了代码重复
  ☐ 是否有单元测试

后端检查:
  ☐ 是否正确使用了异步/等待
  ☐ 是否有适当的日志记录
  ☐ 是否有数据验证
  ☐ 是否有权限检查
  ☐ 是否避免了N+1查询
  ☐ 是否使用了数据库索引

前端检查:
  ☐ 是否避免了不必要的重新渲染
  ☐ 是否正确处理了加载和错误状态
  ☐ 是否有适当的错误边界
  ☐ 是否有类型检查（TypeScript）
  ☐ 是否易于使用和理解
  ☐ 是否响应式设计良好

性能检查:
  ☐ 是否优化了数据库查询
  ☐ 是否使用了缓存
  ☐ 是否避免了内存泄漏
  ☐ 是否有适当的分页
  ☐ 是否压缩了资源

安全检查:
  ☐ 是否验证了所有输入
  ☐ 是否进行了权限检查
  ☐ 是否避免了SQL注入
  ☐ 是否正确处理了敏感数据
  ☐ 是否有适当的日志审计
```

---

## 📚 文档规范

### API文档示例

```markdown
## POST /messages

发送消息

### 请求
- **Content-Type**: application/json
- **Authorization**: Bearer {token}

**Body**:
```json
{
  "conversationId": "uuid",
  "content": "Hello",
  "type": "text",
  "replyTo": "uuid (optional)"
}
```

### 响应

**200 OK**:
```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "content": "Hello",
    "type": "text",
    "createdAt": "2024-04-16T10:30:00Z",
    "status": "sent"
  }
}
```

### 错误响应

| Status | Code | Message |
|--------|------|---------|
| 400 | 40001 | Content is required |
| 401 | 40101 | Unauthorized |
| 403 | 40301 | No permission to send |
| 429 | 42901 | Rate limited |
```

---

## 🚀 发布检查清单

在每次部署前:

```
代码质量:
  ☐ 所有测试通过
  ☐ 代码覆盖率 > 80%
  ☐ 无ESLint错误
  ☐ 无TypeScript类型错误

文档:
  ☐ API文档已更新
  ☐ CHANGELOG已更新
  ☐ README已更新
  ☐ 数据库迁移已编写

性能:
  ☐ 进行了性能测试
  ☐ 大数据集测试通过
  ☐ 内存泄漏检查通过
  ☐ 压力测试通过

安全:
  ☐ 依赖包已更新
  ☐ 安全漏洞扫描通过
  ☐ 敏感信息已移除
  ☐ CORS和CSP配置正确

数据:
  ☐ 备份已测试
  ☐ 迁移脚本已验证
  ☐ 回滚计划已制定
  ☐ 数据库优化已完成

部署:
  ☐ 蓝绿部署计划已制定
  ☐ 金丝雀部署已测试
  ☐ 监控告警已配置
  ☐ 回滚过程已测试
```

这份完整的开发规范已经可以直接用于团队开发。
