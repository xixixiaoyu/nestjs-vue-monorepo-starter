---
trigger: always_on
---

# 项目上下文：NestJS + Vue 3 全栈应用

你是一个熟悉此项目的 AI 开发助手。**编码前必须先理解并严格遵循以下规范**。

## 🏗️ 项目概览

- **架构**: Turborepo Monorepo
- **前端**: Vue 3 + Vite + Shadcn-vue + Tailwind CSS (`apps/web`)
- **后端**: NestJS + Prisma + PostgreSQL (`apps/server`)
- **共享**: 类型定义 (`packages/shared-types`) + ESLint 配置

## 🔒 黄金法则（必须遵守）

1. **代码风格**: 单引号 + 无分号 + 两空格缩进
2. **UI 组件**: 必须从 `@/components/ui` 聚合导入，禁止单独导入
3. **环境变量**: 通过 `ConfigService` 构造函数注入
4. **类型同步**: 前后端共享类型使用 `@shared-types`
5. **数据库**: 使用 Prisma，禁用原生 SQL
6. **API 设计**: 遵循 RESTful + 类验证器

## 🚀 快速检查清单

**每次编码前确认**：

```
□ 使用单引号、无分号、两空格缩进？
□ UI 组件通过 @/components/ui 导入？
□ 环境变量通过 ConfigService 获取？
□ 使用 @shared-types 共享类型？
□ 使用 Prisma 操作数据库？
□ 遵循 RESTful API 设计？
```

## 📁 目录结构速记

```
apps/web/src/
├── components/ui/     # Shadcn-vue 组件
├── pages/            # 页面
├── lib/              # 工具
└── stores/           # Pinia 状态

apps/server/src/
├── modules/          # 业务模块
├── common/           # 通用模块
├── config/           # 配置
└── prisma/           # 数据库服务
```

## 💡 核心代码模式

### 前端 Vue 组件

```vue
<template>
  <div class="flex items-center space-x-2">
    <Button variant="outline">按钮</Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui'
import type { User } from '@shared-types'

const user = ref<User | null>(null)
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
    return this.userService.findOne(id)
  }
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
```

### 导入规范

```typescript
// UI 组件 - 聚合导入
import { Button, Input, Card } from '@/components/ui'

// 工具方法
import { cn } from '@/lib/utils'

// 共享类型
import type { User } from '@shared-types'
```

## 🚫 严格禁止

- **格式**: 双引号 `""`、分号 `;`、4 空格缩进
- **导入**: 单独导入 UI 组件文件
- **配置**: 硬编码配置值
- **数据库**: 绕过 Prisma 直接操作
- **技术栈**: 引入新的工具链或框架

## ✅ 强制要求

- 严格遵循项目既定代码风格
- 保持架构和技术栈一致性
- 使用 `@shared-types` 实现类型同步
- 遵循 RESTful API 设计原则
- 使用类验证器进行输入验证

## 🛠️ 常用命令

```bash
# 前端添加组件
pnpm dlx shadcn-vue@latest add button -y -p src/components/ui

# 后端生成资源
nest g module posts && nest g controller posts && nest g service posts
```

---

**核心原则**: 代码风格一致性 > 实现细节。遇到不确定的情况，优先遵循项目既定模式。
