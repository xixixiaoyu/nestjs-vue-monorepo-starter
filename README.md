# Nest + Vue + Wails 全栈开发模板

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Wails](https://img.shields.io/badge/Wails-000000?style=for-the-badge&logo=wails&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

一个采用 **Turborepo** 的现代化全栈开发模板，集成 **NestJS + Vue 3 + Wails v2**，提供 Web、API、桌面端三端统一的开发体验。

[![CI](https://github.com/your-username/nest-vue-template/workflows/CI/badge.svg)](https://github.com/your-username/nest-vue-template/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>

## 📋 目录

- [项目概述](#-项目概述)
- [✨ 核心特性](#-核心特性)
- [🏗️ 系统架构](#️-系统架构)
- [🛠️ 技术栈](#️-技术栈)
- [🚀 快速开始](#-快速开始)
- [📁 项目结构](#-项目结构)
- [💻 开发指南](#-开发指南)
  - [环境配置](#环境配置)
  - [数据库操作](#数据库操作)
  - [前端开发](#前端开发)
  - [后端开发](#后端开发)
  - [桌面端开发](#桌面端开发)
- [🔧 脚本命令](#-脚本命令)
- [🚀 部署指南](#-部署指南)
- [📚 API 文档](#-api-文档)
- [🧪 测试策略](#-测试策略)
- [🔍 故障排除](#-故障排除)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

## 🌟 项目概述

这是一个专为现代全栈开发设计的单仓库模板，采用 **Turborepo** 进行项目管理，实现了：

- **三端统一**：Web 前端、API 后端、桌面端应用共享代码和类型定义
- **现代化技术栈**：Vue 3 + Composition API、NestJS、Wails v2、TypeScript
- **完整的工程化**：ESLint、Prettier、Husky、Commitlint、CI/CD
- **开箱即用**：预配置认证、数据库、缓存、日志、任务队列等企业级功能

### 适用场景

- 🏢 企业级管理系统
- 📱 跨平台桌面应用
- 🚀 快速原型开发
- 📚 全栈技术学习
- 🛠️ 微服务架构实践

## ✨ 核心特性

### 🎯 三端代码复用
- **前端代码**：Vue 3 应用在 Web 和桌面端完全复用
- **类型安全**：统一的 TypeScript 类型定义
- **API 接口**：前后端共享 API 类型定义
- **业务逻辑**：核心业务逻辑可在多端复用

### 🛠️ 现代化开发体验
- **热重载**：所有端支持热重载开发
- **类型提示**：完整的 TypeScript 支持
- **代码规范**：统一的 ESLint 和 Prettier 配置
- **Git 工作流**：自动化提交检查和 CI/CD

### 🏗️ 企业级架构
- **认证授权**：JWT + 刷新令牌机制
- **数据库**：Prisma ORM + PostgreSQL
- **缓存**：Redis 缓存支持
- **任务队列**：BullMQ 异步任务处理
- **日志系统**：Winston 结构化日志
- **API 文档**：Swagger 自动生成

### 🎨 优秀的用户界面
- **组件库**：Shadcn-vue 高质量组件
- **样式系统**：Tailwind CSS 原子化样式
- **主题支持**：内置暗色模式
- **响应式设计**：适配各种屏幕尺寸

## 🏗️ 系统架构

```mermaid
graph TB
    subgraph "开发环境"
        subgraph "Web 端"
            A[Vue 3 + Vite]
            B[Shadcn-vue + Tailwind]
        end
        
        subgraph "桌面端"
            C[Wails v2]
            D[Go Backend]
        end
        
        subgraph "API 后端"
            E[NestJS]
            F[Prisma ORM]
        end
        
        subgraph "基础设施"
            G[PostgreSQL]
            H[Redis]
            I[BullMQ]
        end
    end
    
    subgraph "共享层"
        J[TypeScript 类型]
        K[ESLint 配置]
        L[工具函数]
    end
    
    A --> E
    C --> A
    C --> D
    E --> F
    E --> G
    E --> H
    E --> I
    
    A -.-> J
    C -.-> J
    E -.-> J
    
    A -.-> K
    C -.-> K
    E -.-> K
```

### 架构说明

- **Monorepo 管理**：使用 Turborepo 管理多包依赖和构建
- **类型共享**：前后端共享 TypeScript 类型定义
- **API 设计**：RESTful API + GraphQL 支持（可扩展）
- **数据流**：单向数据流，状态管理使用 Pinia
- **安全策略**：CORS、CSP、JWT 认证、请求验证

## 🛠️ 技术栈

### 前端技术栈
- **框架**：Vue 3.5.25、Composition API
- **构建工具**：Vite 7.2.4
- **UI 组件**：Shadcn-vue、Radix Vue 1.9.17、Lucide Icons 0.555.0
- **样式方案**：Tailwind CSS 4.1.17、CSS Variables
- **状态管理**：Pinia 3.0.4
- **路由管理**：Vue Router 4.6.3
- **HTTP 客户端**：Axios 1.13.2
- **工具库**：@vueuse/core 14.1.0、class-variance-authority 0.7.1、clsx 2.1.1、tailwind-merge 3.4.0

### 后端技术栈
- **框架**：NestJS 11.1.9
- **语言**：TypeScript 5.9.3
- **数据库**：PostgreSQL 16+、Prisma ORM 7.0.1
- **缓存**：Redis 7+、ioredis 5.8.2
- **认证**：JWT、Passport.js、bcryptjs 3.0.3
- **任务队列**：BullMQ 5.65.0
- **日志**：Winston 3.18.3
- **API 文档**：Swagger/OpenAPI 3.0
- **验证**：class-validator 0.14.3、class-transformer 0.5.1
- **安全**：Helmet 8.1.0、CORS、Rate Limiting

### 桌面端技术栈
- **框架**：Wails v2
- **语言**：Go 1.21+
- **前端集成**：复用 Vue 3 应用（端口 5173）
- **原生功能**：文件操作、窗口控制、系统通知
- **构建工具**：Wails CLI、Go 编译器
- **应用信息**：Desktop App v0.1.0

### 工程化工具
- **包管理**：pnpm 9.12.0
- **Monorepo**：Turborepo 2.6.1
- **代码规范**：ESLint 9.39.1、Prettier 3.7.2
- **Git 工具**：Husky 9.1.7、Commitlint 20.1.0、lint-staged 16.2.7
- **测试框架**：Vitest 4.0.14、Vue Test Utils 2.4.6
- **CI/CD**：GitHub Actions
- **容器化**：Docker、Docker Compose

## 🚀 快速开始

### 环境要求

- **Node.js**：20.0+ 
- **pnpm**：9.0+
- **Go**：1.21+（桌面端开发）
- **Docker**：20.0+（数据库服务）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/nest-vue-template.git
   cd nest-vue-template
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动数据库服务**
   ```bash
   docker compose up -d
   ```

4. **初始化数据库**
   ```bash
   pnpm db:generate
   pnpm --filter @server prisma:migrate:dev
   ```

5. **启动开发服务器**
   ```bash
   # 启动 Web 和 API 服务
   pnpm run dev
   
   # 或启动所有服务（包括桌面端）
   pnpm run dev:all
   ```

6. **访问应用**
   - Web 前端：http://localhost:5173
   - API 服务：http://localhost:3001
   - API 文档：http://localhost:3001/docs
   - 桌面端：独立窗口应用

### 快速验证

```bash
# 检查 API 健康状态
curl http://localhost:3001/health

# 检查前端是否正常运行
curl http://localhost:5173
```

## 📁 项目结构

```
nest-vue-template/
├── apps/                          # 应用程序
│   ├── web/                       # Vue 3 前端应用
│   │   ├── src/
│   │   │   ├── components/        # Vue 组件
│   │   │   │   └── ui/           # UI 组件库
│   │   │   ├── views/            # 页面组件
│   │   │   ├── router/           # 路由配置
│   │   │   ├── stores/           # 状态管理
│   │   │   ├── services/         # API 服务
│   │   │   ├── lib/              # 工具函数
│   │   │   └── assets/           # 静态资源
│   │   ├── components.json       # Shadcn-vue 配置
│   │   ├── tailwind.config.ts    # Tailwind 配置
│   │   └── vite.config.ts        # Vite 配置
│   │
│   ├── server/                    # NestJS 后端应用
│   │   ├── src/
│   │   │   ├── auth/             # 认证模块
│   │   │   ├── users/            # 用户模块
│   │   │   ├── common/           # 公共模块
│   │   │   ├── config/           # 配置模块
│   │   │   ├── prisma/           # 数据库服务
│   │   │   ├── redis/            # Redis 服务
│   │   │   ├── email/            # 邮件服务
│   │   │   ├── cache/            # 缓存服务
│   │   │   └── winston/          # 日志服务
│   │   ├── prisma/               # 数据库模式
│   │   └── test/                 # 测试文件
│   │
│   └── desktop/                   # Wails 桌面应用
│       ├── src/                   # Go 源码
│       ├── wails.json            # Wails 配置
│       ├── main.go               # 应用入口
│       └── scripts/              # 构建脚本
│
├── packages/                      # 共享包
│   ├── eslint-config-custom/     # ESLint 配置
│   ├── shared-types/             # 共享类型定义
│   ├── shared-ui/               # 共享 UI 组件
│   ├── tsconfig/                 # TypeScript 配置
│   └── vitest-config/            # Vitest 配置
│
├── scripts/                       # 项目脚本
│   └── setup-wails.sh            # Wails 环境设置
│
├── .github/                       # GitHub 配置
│   └── workflows/                # CI/CD 工作流
│
├── .husky/                        # Git 钩子
├── docker-compose.yml             # Docker 服务配置
├── turbo.json                     # Turborepo 配置
├── pnpm-workspace.yaml           # pnpm 工作空间配置
└── package.json                   # 根项目配置
```

## 💻 开发指南

### 环境配置

#### 1. 环境变量设置

**后端环境变量** (`apps/server/.env`):
```env
# 服务配置
NODE_ENV=development
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb

# Redis 配置
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**前端环境变量** (`apps/web/.env`):
```env
# API 配置
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_NAME=Nest Vue Template
VITE_APP_VERSION=1.0.0
```

#### 2. 开发工具配置

推荐使用 **VS Code** 并安装以下扩展：
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Go (桌面端开发)

### 数据库操作

#### 使用 Prisma CLI

```bash
# 生成 Prisma Client
pnpm db:generate

# 运行数据库迁移
pnpm --filter @server prisma:migrate:dev

# 重置数据库 (需要手动添加到 package.json 或使用完整命令)
pnpm --filter @server prisma migrate reset

# 打开 Prisma Studio
pnpm db:studio

# 推送 schema 到数据库
pnpm db:push
```

#### 数据库模型示例

```prisma
// apps/server/prisma/schema.prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  password     String?
  role         String        @default("user")
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  refreshTokens RefreshToken[]
}
```

### 前端开发

#### 1. 添加新的 UI 组件

```bash
# 在 apps/web 目录下执行
pnpm dlx shadcn-vue@latest add button card input -y -p src/components/ui
```

#### 2. 组件使用示例

```vue
<template>
  <div class="container mx-auto p-4">
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
      </CardHeader>
      <CardContent>
        <Button @click="handleClick">点击我</Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'

const handleClick = () => {
  console.log('按钮被点击')
}
</script>
```

#### 3. API 调用示例

```typescript
// apps/web/src/services/user.service.ts
import { apiService } from './unified-api'
import type { UserDto, CreateUserInput } from '@project/shared-types'

export class UserService {
  async getUsers(): Promise<UserDto[]> {
    const response = await apiService.httpGet<UserDto[]>('/users')
    return response.data || []
  }

  async createUser(data: CreateUserInput): Promise<UserDto> {
    const response = await apiService.httpPost<UserDto>('/users', data)
    return response.data!
  }
}

export const userService = new UserService()
```

### 后端开发

#### 1. 创建新模块

```bash
# 生成新模块
pnpm --filter @server nest g module products
pnpm --filter @server nest g controller products
pnpm --filter @server nest g service products
```

#### 2. 控制器示例

```typescript
// apps/server/src/products/products.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { ProductsService } from './products.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { CreateProductDto } from '@project/shared-types'

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll()
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }
}
```

#### 3. 服务示例

```typescript
// apps/server/src/products/products.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateProductDto, ProductDto } from '@project/shared-types'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ProductDto[]> {
    return this.prisma.product.findMany()
  }

  async create(data: CreateProductDto): Promise<ProductDto> {
    return this.prisma.product.create({ data })
  }
}
```

### 桌面端开发

#### 1. 环境设置

```bash
# 设置 Wails 开发环境
pnpm run setup:wails
```

#### 2. 添加新的 Go 方法

```go
// apps/desktop/src/app/app.go
package app

import (
	"context"
	"fmt"
)

type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// OnStartup is called when the app starts up.
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx
}

// ShowMessage 显示消息框
func (a *App) ShowMessage(title, message string) {
	// 使用 Wails runtime 显示消息
	dialog := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Title:   title,
		Message: message,
	})
	dialog.Show()
}

// GetSystemInfo 获取系统信息
func (a *App) GetSystemInfo() map[string]interface{} {
	return map[string]interface{}{
		"platform": runtime.Environment(a.ctx).Platform,
		"arch":     runtime.Environment(a.ctx).Arch,
		"version":  runtime.Environment(a.ctx).BuildVersion,
	}
}
```

#### 3. 前端调用桌面端 API

```typescript
// apps/web/src/services/desktop.service.ts
import { isDesktop } from '@/utils/environment'

export class DesktopService {
  async showMessage(title: string, message: string): Promise<void> {
    if (!isDesktop() || !window.go?.main?.App) {
      throw new Error('桌面端 API 不可用')
    }
    
    await window.go.main.App.ShowMessage(title, message)
  }

  async getSystemInfo(): Promise<Record<string, any>> {
    if (!isDesktop() || !window.go?.main?.App) {
      throw new Error('桌面端 API 不可用')
    }
    
    return await window.go.main.App.GetSystemInfo()
  }
}

export const desktopService = new DesktopService()
```

## 🔧 脚本命令

### 根目录脚本

```bash
# 开发相关
pnpm run dev              # 启动 Web 和 Server 开发模式
pnpm run dev:web          # 仅启动 Web 前端
pnpm run dev:server       # 仅启动 API 后端
pnpm run dev:desktop      # 仅启动桌面端
pnpm run dev:all          # 启动所有服务

# 构建相关
pnpm run build            # 构建所有应用
pnpm run build:desktop    # 仅构建桌面端应用

# 代码质量
pnpm run typecheck        # 类型检查
pnpm run lint             # 代码检查
pnpm run lint:fix         # 自动修复代码问题
pnpm run format           # 代码格式化
pnpm run format:check     # 检查代码格式

# 测试相关
pnpm run test             # 运行所有测试
pnpm run test:coverage    # 运行测试并生成覆盖率报告

# 数据库相关
pnpm run db:generate      # 生成 Prisma Client
pnpm run db:push          # 推送 schema 到数据库
pnpm run db:migrate       # 运行数据库迁移 (别名: pnpm --filter @server prisma:migrate:dev)
pnpm run db:studio        # 打开 Prisma Studio

# 清理相关
pnpm run clean            # 清理构建文件
pnpm run clean:all        # 完全清理并重新安装
```

### 应用特定脚本

```bash
# Web 应用
pnpm --filter @web run dev          # 启动开发服务器
pnpm --filter @web run build        # 构建生产版本
pnpm --filter @web run preview      # 预览构建结果
pnpm --filter @web run test         # 运行测试

# Server 应用
pnpm --filter @server run dev       # 启动开发服务器
pnpm --filter @server run build     # 构建应用
pnpm --filter @server run start     # 启动生产服务器
pnpm --filter @server run test      # 运行测试

# Desktop 应用
pnpm --filter @desktop run dev      # 启动开发模式
pnpm --filter @desktop run build    # 构建桌面应用
```

## 🚀 部署指南

### Docker 部署

#### 1. 使用 Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped

volumes:
  postgres-data:
```

#### 2. 部署命令

```bash
# 构建并启动所有服务
docker compose -f docker-compose.prod.yml up -d --build

# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

### 传统部署

#### 1. 服务器要求

- **操作系统**：Ubuntu 20.04+ / CentOS 8+
- **Node.js**：20.0+
- **PostgreSQL**：16+
- **Redis**：7+
- **Nginx**：1.18+（可选）

#### 2. 部署步骤

```bash
# 1. 克隆代码
git clone https://github.com/your-username/nest-vue-template.git
cd nest-vue-template

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
# 编辑环境变量文件

# 4. 构建应用
pnpm run build

# 5. 设置数据库
pnpm db:generate
pnpm --filter @server prisma:migrate:dev

# 6. 启动服务
# 使用 PM2 管理进程
npm install -g pm2
pm2 start ecosystem.config.js
```

#### 3. Nginx 配置示例

```nginx
# /etc/nginx/sites-available/nest-vue-template
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 桌面端分发

#### 1. 构建分发版本

```bash
# 构建所有平台的桌面应用
pnpm --filter @desktop run build

# 构建特定平台
pnpm --filter @desktop run build:debug  # 调试版本
```

#### 2. 分发文件位置

构建完成后，分发文件位于：
- **Windows**：`apps/desktop/build/bin/desktop.exe`
- **macOS**：`apps/desktop/build/bin/desktop.app`
- **Linux**：`apps/desktop/build/bin/desktop`

## 📚 API 文档

### 访问 API 文档

启动开发服务器后，访问以下地址查看完整的 API 文档：

- **Swagger UI**：http://localhost:3001/docs
- **OpenAPI JSON**：http://localhost:3001/docs-json

### 主要 API 端点

#### 认证相关

```http
POST   /auth/login          # 用户登录
POST   /auth/register       # 用户注册
POST   /auth/refresh        # 刷新令牌
POST   /auth/logout         # 用户登出
```

#### 用户管理

```http
GET    /api/users               # 获取用户列表
GET    /api/users/:id           # 获取用户详情
POST   /api/users               # 创建用户
PUT    /api/users/:id           # 更新用户
DELETE /api/users/:id           # 删除用户
GET    /api/users/me            # 获取当前用户信息
```

#### 系统相关

```http
GET    /api/health              # 健康检查
GET    /api/info                # 应用信息
```

### API 使用示例

#### JavaScript/TypeScript

```typescript
// 登录示例
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
})

const { accessToken, refreshToken, user } = await loginResponse.json()

// 使用访问令牌调用受保护的 API
const usersResponse = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})

const users = await usersResponse.json()
```

#### cURL 示例

```bash
# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 获取用户列表（需要认证）
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 测试策略

### 测试框架

- **单元测试**：Vitest
- **集成测试**：Vitest + Supertest
- **端到端测试**：Playwright（可扩展）
- **组件测试**：Vue Test Utils

### 测试命令

```bash
# 运行所有测试
pnpm run test

# 运行特定应用的测试
pnpm --filter @web run test
pnpm --filter @server run test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 监听模式运行测试
pnpm --filter @web run test:watch
pnpm --filter @server run test:watch
```

### 测试示例

#### 前端组件测试

```typescript
// apps/web/src/components/Button.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

#### 后端 API 测试

```typescript
// apps/server/test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

describe('Auth (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined()
        expect(res.body.refreshToken).toBeDefined()
        expect(res.body.user).toBeDefined()
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
```

### 测试覆盖率配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

## 🔍 故障排除

### 常见问题

#### 1. 端口冲突

**问题**：启动时提示端口已被占用

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3001  # API 端口
lsof -i :5173  # Web 端口

# 终止进程
kill -9 <PID>

# 或修改配置文件中的端口
```

#### 2. 数据库连接失败

**问题**：无法连接到 PostgreSQL 数据库

**解决方案**：
```bash
# 检查数据库服务状态
docker compose ps

# 重启数据库服务
docker compose restart postgres

# 检查连接字符串
echo $DATABASE_URL
```

#### 3. 依赖安装失败

**问题**：pnpm install 失败

**解决方案**：
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 重新安装
rm -rf node_modules
pnpm install

# 使用国内镜像（如果需要）
pnpm config set registry https://registry.npmmirror.com/
```

#### 4. 桌面端启动失败

**问题**：Wails 应用无法启动

**解决方案**：
```bash
# 检查 Go 环境
go version

# 重新设置 Wails 环境
pnpm run setup:wails

# 检查前端构建
pnpm --filter @web run build
```

#### 5. TypeScript 类型错误

**问题**：类型检查失败

**解决方案**：
```bash
# 重新生成类型
pnpm db:generate

# 检查共享类型包
pnpm --filter @shared-types run build

# 重启 TypeScript 服务（VS Code）
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 调试技巧

#### 1. 启用详细日志

```bash
# 启动时添加详细日志
DEBUG=* pnpm run dev

# 或设置环境变量
export DEBUG=app:*
pnpm run dev
```

#### 2. 使用浏览器开发者工具

- **网络面板**：检查 API 请求
- **控制台**：查看错误信息
- **源代码面板**：调试前端代码

#### 3. 后端调试

```typescript
// 添加调试日志
import { Logger } from '@nestjs/common'

const logger = new Logger('UserService')

async findAll() {
  logger.log('Fetching all users')
  const users = await this.prisma.user.findMany()
  logger.debug(`Found ${users.length} users`)
  return users
}
```

### 性能优化

#### 1. 前端优化

```typescript
// 使用懒加载
const LazyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// 使用 computed 缓存计算结果
const filteredUsers = computed(() => {
  return users.value.filter(user => user.isActive)
})
```

#### 2. 后端优化

```typescript
// 使用数据库索引
// prisma/schema.prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  // 添加索引
  @@index([email])
}

// 使用查询优化
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
  where: {
    isActive: true,
  },
  take: 20,
  skip: page * 20,
})
```

## 🤝 贡献指南

### 开发流程

1. **Fork 项目**到你的 GitHub 账户
2. **创建功能分支**：`git checkout -b feature/amazing-feature`
3. **提交更改**：`git commit -m 'feat: add amazing feature'`
4. **推送分支**：`git push origin feature/amazing-feature`
5. **创建 Pull Request**

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能添加
git commit -m "feat: add user authentication"

# 问题修复
git commit -m "fix: resolve login validation error"

# 文档更新
git commit -m "docs: update API documentation"

# 样式调整
git commit -m "style: fix button alignment"

# 重构代码
git commit -m "refactor: optimize database queries"

# 性能优化
git commit -m "perf: improve page load speed"

# 测试相关
git commit -m "test: add unit tests for user service"

# 构建相关
git commit -m "build: update dependencies"
```

### 代码规范

#### 1. TypeScript/JavaScript

- 使用单引号
- 不使用分号
- 使用 2 空格缩进
- 使用 ES6+ 语法

#### 2. Vue 组件

- 使用 Composition API
- 组件名使用 PascalCase
- Props 定义要完整
- 使用 TypeScript 类型注解

#### 3. NestJS

- 使用装饰器
- 依赖注入模式
- 统一的错误处理
- 完整的类型定义

### Pull Request 要求

1. **通过所有测试**：`pnpm test`
2. **通过代码检查**：`pnpm lint`
3. **通过类型检查**：`pnpm typecheck`
4. **更新相关文档**
5. **添加必要的测试**

### 问题报告

使用 GitHub Issues 报告问题时，请包含：

- **问题描述**：清晰描述遇到的问题
- **复现步骤**：详细的复现步骤
- **环境信息**：操作系统、Node.js 版本等
- **错误日志**：完整的错误信息
- **期望行为**：描述你期望的正确行为

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🙏 致谢

感谢以下开源项目：

- [NestJS](https://nestjs.com/) - 渐进式 Node.js 框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Wails](https://wails.io/) - Go + Web 桌面应用框架
- [Turborepo](https://turbo.build/) - 高性能构建系统
- [Prisma](https://www.prisma.io/) - 现代数据库工具包
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Shadcn-vue](https://www.shadcn-vue.com/) - 高质量 Vue 组件库

## 📞 联系方式

- **项目主页**：https://github.com/your-username/nest-vue-template
- **问题反馈**：https://github.com/your-username/nest-vue-template/issues
- **邮箱**：your-email@example.com

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ 支持一下！**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>
