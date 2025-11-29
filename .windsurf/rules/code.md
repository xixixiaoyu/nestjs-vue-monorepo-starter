---
trigger: always_on
---

# 项目上下文：NestJS + Vue 3 + Wails 全栈应用

你是一个熟悉此项目的 AI 开发助手。**编码前必须先理解并严格遵循以下规范**。

## 🏗️ 项目概览

- **架构**: Turborepo Monorepo + 多端支持
- **前端**: Vue 3 + Vite + Shadcn-vue + Tailwind CSS (`apps/web`)
- **后端**: NestJS + Prisma + PostgreSQL + Redis + Bull (`apps/server`)
- **桌面端**: Wails + Go (`apps/desktop`)
- **共享**: 类型定义 (`packages/shared-types`) + ESLint 配置 + 工具库

## 🔒 黄金法则（必须遵守）

1. **代码风格**: 单引号 + 无分号 + 两空格缩进
2. **UI 组件**: 必须从 `@/components/ui` 聚合导入，禁止单独导入
3. **环境变量**: 通过 `ConfigService` 构造函数注入
4. **类型同步**: 前后端共享类型使用 `@shared-types`
5. **数据库**: 使用 Prisma，禁用原生 SQL
6. **API 设计**: 遵循 RESTful + 类验证器 + 统一错误处理
7. **状态管理**: 前端使用 Pinia，后端使用 Redis 缓存
8. **多端兼容**: Web 和 Desktop 端使用统一 API 服务

## 🚀 快速检查清单

**每次编码前确认**：

```
□ 使用单引号、无分号、两空格缩进？
□ UI 组件通过 @/components/ui 导入？
□ 环境变量通过 ConfigService 获取？
□ 使用 @shared-types 共享类型？
□ 使用 Prisma 操作数据库？
□ 遵循 RESTful API 设计？
□ 使用 BaseService 处理通用逻辑？
□ 多端兼容使用 UnifiedApiService？
```

## 📁 目录结构速记

```
apps/web/src/
├── components/ui/     # Shadcn-vue 组件（聚合导出）
├── views/            # 页面组件
├── stores/           # Pinia 状态管理
├── services/         # API 服务层
├── lib/              # 工具函数
└── utils/            # 环境检测等

apps/server/src/
├── modules/          # 业务模块
├── common/           # 通用模块（BaseService, 异常处理等）
├── config/           # 配置
├── prisma/           # 数据库服务
├── auth/             # 认证授权
├── cache/            # Redis 缓存
└── email/            # 邮件服务

apps/desktop/src/
├── app/              # Wails 应用逻辑
└── web/              # 嵌入的 Web 前端

packages/shared-types/src/
├── index.ts          # 主要类型定义
└── wails/            # Wails 特定类型
```

## 💡 核心代码模式

### 前端 Vue 组件

```vue
<template>
  <div class="flex items-center space-x-2">
    <Button variant="outline">按钮</Button>
    <Alert v-if="error" variant="destructive">{{ error }}</Alert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Alert } from '@/components/ui'
import type { User } from '@shared-types'
import { apiService } from '@/services/unified-api'

const user = ref<User | null>(null)
const error = ref<string>('')

const loadUser = async () => {
  try {
    const response = await apiService.getCurrentUser()
    user.value = response.data
  } catch (e) {
    error.value = e.message
  }
}
</script>
```

### 后端 NestJS 模块

```typescript
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id)
  }
}

@Injectable()
export class UsersService extends BaseService {
  constructor(prisma: PrismaService, configService: ConfigService) {
    super(prisma, configService)
  }

  async findById(id: string): Promise<UserDto | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } })
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }
}
```

### 状态管理（Pinia）

```typescript
export const useAuthStore = defineStore('auth', () => {
  const user = ref<JwtPayload | null>(null)
  const loading = ref(false)

  const login = async (credentials: LoginInput): Promise<boolean> => {
    loading.value = true
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      jwtUtils.setAccessToken(response.accessToken)
      user.value = jwtUtils.getCurrentUser()
      return true
    } catch (err) {
      return false
    } finally {
      loading.value = false
    }
  }

  return { user, loading, login }
})
```

### 导入规范

```typescript
// UI 组件 - 聚合导入
import { Button, Input, Card, Alert } from '@/components/ui'

// 工具方法
import { cn } from '@/lib/utils'

// 共享类型
import type { User, LoginInput, AuthResponse } from '@shared-types'

// 服务层
import { apiService } from '@/services/unified-api'
import { useAuthStore } from '@/stores/auth.store'
```

## 🔧 技术栈细节

### 前端技术栈
- **Vue 3**: Composition API + `<script setup>`
- **Vite**: 构建工具 + 开发服务器
- **Shadcn-vue**: UI 组件库（基于 Radix Vue）
- **Tailwind CSS**: 样式框架 + CSS 变量主题系统
- **Pinia**: 状态管理
- **Vue Router**: 路由管理
- **Axios**: HTTP 客户端（封装在 apiService 中）

### 后端技术栈
- **NestJS**: 企业级 Node.js 框架
- **Prisma**: ORM + 数据库迁移
- **PostgreSQL**: 主数据库
- **Redis**: 缓存 + 会话存储
- **Bull**: 队列管理
- **JWT**: 认证授权
- **Winston**: 日志管理
- **Class Validator**: 数据验证

### 桌面端技术栈
- **Wails**: Go + Web 前端混合开发
- **Go**: 后端逻辑 + 系统调用
- **UnifiedApiService**: 跨平台 API 抽象层

## 🚫 严格禁止

- **格式**: 双引号 `""`、分号 `;`、4 空格缩进
- **导入**: 单独导入 UI 组件文件
- **配置**: 硬编码配置值
- **数据库**: 绕过 Prisma 直接操作
- **技术栈**: 引入新的工具链或框架
- **状态**: 直接修改 props，使用 mutations 模式
- **错误**: 抛出非业务异常，使用 BaseService 统一处理

## ✅ 强制要求

- 严格遵循项目既定代码风格
- 保持架构和技术栈一致性
- 使用 `@shared-types` 实现类型同步
- 遵循 RESTful API 设计原则
- 使用类验证器进行输入验证
- 继承 BaseService 处理通用逻辑
- 使用 UnifiedApiService 实现多端兼容
- 错误处理使用业务异常类

## 🛠️ 常用命令

```bash
# 前端添加组件
pnpm dlx shadcn-vue@latest add button -y -p src/components/ui

# 后端生成资源
nest g module posts && nest g controller posts && nest g service posts

# 数据库操作
pnpm db:generate  # 生成 Prisma 客户端
pnpm db:push      # 推送 schema 到数据库
pnpm db:migrate   # 运行迁移
pnpm db:studio    # 打开 Prisma Studio

# 开发命令
pnpm dev          # 启动所有服务
pnpm dev:web      # 仅启动前端
pnpm dev:server   # 仅启动后端
pnpm dev:desktop  # 仅启动桌面端
```

## 🔄 多端开发模式

### Web 端开发
- 使用 Vite 开发服务器（端口 5173）
- API 请求通过代理转发到后端（端口 3001）
- 支持热重载和快速刷新

### Desktop 端开发
- 使用 Wails 开发模式
- 直接连接后端 API（无代理）
- 支持原生系统功能调用

### 统一 API 服务
```typescript
// 自动检测环境并选择合适的 API 端点
const apiService = new UnifiedApiService()
// Web: /api -> http://localhost:3001
// Desktop: http://localhost:3001
```

## 📊 性能优化

### 前端优化
- 使用 Vue 3 的 Suspense 和异步组件
- 实现虚拟滚动和懒加载
- 利用 Pinia 的持久化存储
- 使用 Tailwind CSS 的 JIT 模式

### 后端优化
- Prisma 查询优化和字段选择
- Redis 缓存热点数据
- Bull 队列处理异步任务
- Winston 结构化日志记录

---

**核心原则**: 代码风格一致性 > 实现细节。遇到不确定的情况，优先遵循项目既定模式。多端兼容性是关键考虑因素。
