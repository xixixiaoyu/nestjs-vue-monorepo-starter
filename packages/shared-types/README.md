# Shared Types 包使用指南

这个包提供了一个统一的类型系统，支持 NestJS 后端和 Vue3 前端之间的类型共享。

## 🏗️ 架构概览

```
packages/shared-types/src/
├── schemas/          # Zod Schema 定义（主要用于后端验证）
├── types/            # 纯 TypeScript 类型（前后端共享）
├── dtos/             # 后端专用 DTO 类（使用 createZodDto）
├── wails/            # Wails 桌面应用类型定义
└── index.ts          # 主入口文件
```

## 📦 安装依赖

```bash
# 在 shared-types 目录下
pnpm install

# 在使用此包的项目中
pnpm add @project/shared-types
```

## 🔧 使用方法

### 后端 (NestJS)

后端可以使用三种不同的导入方式：

#### 1. 使用 Zod Schema（推荐用于验证）

```typescript
import { CreateUserSchema, SendWelcomeEmailSchema } from '@project/shared-types'
import { ZodValidationPipe } from 'nestjs-zod'

@Controller('users')
export class UsersController {
  @Post()
  async create(@Body(new ZodValidationPipe(CreateUserSchema)) userData: CreateUserInput) {
    // userData 已经通过 Zod 验证
    return this.usersService.create(userData)
  }
}
```

#### 2. 使用 DTO 类（使用 createZodDto）

```typescript
import { CreateUserRequestDto, SendWelcomeEmailRequestDto } from '@project/shared-types'

@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() userData: CreateUserRequestDto) {
    // DTO 类自动包含验证逻辑
    return this.usersService.create(userData)
  }
}
```

#### 3. 直接使用 Schema 和验证管道

```typescript
import { CreateUserSchema } from '@project/shared-types'
import { ZodValidationPipe } from 'nestjs-zod'

@Controller('users')
export class UsersController {
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) 
    userData: CreateUserInput
  ) {
    return this.usersService.create(userData)
  }
}
```

### 前端 (Vue3)

前端只需要导入纯 TypeScript 类型：

```typescript
import type { 
  CreateUserInput, 
  UserDto, 
  LoginInput, 
  AuthResponse 
} from '@project/shared-types'

// API 服务
class UserService {
  async createUser(userData: CreateUserInput): Promise<UserDto> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return response.json()
  }
}

// Vue Composition API
import { ref } from 'vue'

export function useUserManagement() {
  const users = ref<UserDto[]>([])
  
  const createUser = async (userData: CreateUserInput) => {
    const newUser = await new UserService().createUser(userData)
    users.value.push(newUser)
  }
  
  return { users, createUser }
}
```

## 🎯 核心优势

### 1. 类型安全
- 前后端使用相同的类型定义
- 编译时类型检查，减少运行时错误
- IDE 智能提示和自动补全

### 2. 验证一致性
- 后端使用 Zod Schema 进行数据验证
- 前端类型与后端验证规则保持一致
- 减少前后端数据格式不匹配问题

### 3. 开发效率
- 一次定义，多处使用
- 类型变更自动同步到前后端
- 减少重复的类型定义工作

### 4. 维护性
- 集中管理所有共享类型
- 清晰的文件组织结构
- 易于扩展和修改

## 📋 可用的类型和 Schema

### 用户相关
- `CreateUserSchema` / `CreateUserInput` / `CreateUserRequestDto`
- `UserSchema` / `UserDto` / `UserResponseDto`

### 认证相关
- `LoginSchema` / `LoginInput` / `LoginRequestDto`
- `RegisterSchema` / `RegisterInput` / `RegisterRequestDto`
- `AuthResponseSchema` / `AuthResponse` / `AuthResponseDto`
- `JwtPayloadSchema` / `JwtPayload` / `JwtPayloadDto`

### 邮件相关
- `SendWelcomeEmailSchema` / `SendWelcomeEmailDto` / `SendWelcomeEmailRequestDto`

### API 响应
- `ApiResponse<T>` - 通用 API 响应格式
- `ApiError` - 错误响应格式
- `PaginatedResponse<T>` - 分页响应格式

### 其他
- `PaginationParams` / `PaginationParamsDto` - 分页参数
- `HealthDto` / `HealthResponseDto` - 健康检查
- `UserRole` - 用户角色枚举

## 🚀 最佳实践

### 1. 命名约定
- Schema: `PascalCase + Schema` (如 `CreateUserSchema`)
- 类型: `PascalCase + Input/Dto/Response` (如 `CreateUserInput`)
- DTO 类: `PascalCase + Request/Response + Dto` (如 `CreateUserRequestDto`)

### 2. 导入规范
```typescript
// 后端 - 根据需要选择
import { CreateUserSchema } from '@project/shared-types'           // Schema
import { CreateUserRequestDto } from '@project/shared-types'       // DTO 类
import type { CreateUserInput } from '@project/shared-types'      // 纯类型

// 前端 - 只使用纯类型
import type { CreateUserInput, UserDto } from '@project/shared-types'
```

### 3. 扩展新类型
1. 在 `schemas/index.ts` 中定义 Zod Schema
2. 在 `types/index.ts` 中导出对应的 TypeScript 类型
3. 在 `dtos/index.ts` 中创建 DTO 类（如需要）
4. 更新 `index.ts` 导出新类型

### 4. 验证策略
- 后端：使用 Zod Schema + ZodValidationPipe
- 前端：使用 TypeScript 类型进行编译时检查
- 可选：前端添加运行时验证函数

## 🔍 示例代码

详细的使用示例请参考本文件中的各个章节，包含了前后端完整的类型使用方法。

## 📝 注意事项

1. **前端不要导入 DTO 类**：DTO 类包含 nestjs-zod 依赖，只能在后端使用
2. **类型导入使用 `import type`**：确保不会在运行时包含不必要的代码
3. **保持 Schema 和类型同步**：修改 Schema 时记得更新对应的类型定义
4. **版本管理**：重大变更时考虑包版本升级

## 🤝 贡献指南

1. 新增类型时遵循现有的命名和文件组织规范
2. 确保前后端兼容性
3. 添加相应的示例和文档
4. 运行类型检查确保没有错误

---

通过这个共享类型系统，你可以实现前后端的类型安全，提高开发效率，并减少因类型不一致导致的 bug。