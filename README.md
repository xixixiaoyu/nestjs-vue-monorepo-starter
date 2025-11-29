# NestJS Vue Monorepo Starter 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered by: Turborepo](https://img.shields.io/badge/Powered%20by-Turborepo-orange)](https://turbo.build/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个功能齐全、遵循最佳实践的全栈 Monorepo 项目模板，使用 NestJS, Vue 3, Prisma, Turborepo 和 pnpm 构建。

---

## ✨ 特性

- 📦 **Monorepo 架构**: 使用 `pnpm` 和 `Turborepo` 管理，实现极致的开发效率和依赖管理。
- 🔧 **统一的工具链**: ESLint, Prettier, TypeScript 配置共享，保证代码质量和风格一致。
- 🤝 **类型安全的全栈体验**: 在 `packages/shared-types` 中定义 DTOs，实现前后端类型共享，告别联调噩梦。
- 🚀 **现代前端**: Vue 3 + Vite + TypeScript + Pinia + Tailwind CSS，享受极致的开发体验。
- 📡 **强大的后端**: NestJS + Express + Prisma，兼具开发效率、性能和类型安全。
- ⚡️ **增量构建与缓存**: Turborepo 带来了极速的构建和 CI/CD 体验。
- 📝 **代码规范**: 内置 Husky, lint-staged, commitlint，从源头保证代码库的整洁。

## 🛠️ 技术栈

| 领域       | 技术                                                              |
| :--------- | :---------------------------------------------------------------- |
| **Monorepo** | `pnpm`, `Turborepo`                                               |
| **后端**     | `NestJS`, `Express`, `Prisma`, `PostgreSQL`                       |
| **前端**     | `Vue 3`, `Vite`, `TypeScript`, `Pinia`, `Element Plus`, `Tailwind CSS` |
| **共享**     | `shared-types` (DTOs), `eslint-config-custom`, `tsconfig`         |
| **测试**     | `Vitest`                                                          |

## 📂 目录结构

```
/
├── apps/
│   ├── web/          # Vue 3 前端应用
│   └── server/       # NestJS 后端应用
├── packages/
│   ├── shared-types/ # 前后端共享类型
│   ├── eslint-config-custom/ # 共享 ESLint 配置
│   └── tsconfig/     # 共享 tsconfig 配置
├── pnpm-workspace.yaml
└── turbo.json
```

## 🚀 快速开始

### 1. 环境准备

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (v8+)
- [PostgreSQL](https://www.postgresql.org/) 数据库

### 2. 克隆项目

```bash
git clone https://github.com/your-username/nestjs-vue-monorepo-starter.git
cd nestjs-vue-monorepo-starter
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 配置环境变量

复制 `.env.example` 文件为 `.env`，并填入你的数据库连接信息。

```bash
# /apps/server/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 5. 数据库迁移

使用 Prisma 来同步数据库结构。

```bash
# 进入后端应用目录
cd apps/server

# 生成 Prisma Client
pnpm prisma generate

# 将 schema 推送到数据库
pnpm prisma db push
```

### 6. 启动项目

回到**根目录**，运行开发命令。

```bash
# 回到根目录
cd ../..

# 启动所有应用 (前端 + 后端)
pnpm dev
```

- 前端应用将在 `http://localhost:5173` 运行。
- 后端服务将在 `http://localhost:3000` 运行。
- 后端 API 文档 (Swagger) 在 `http://localhost:3000/api`。

## 📜 可用命令

所有命令都应在**项目根目录**下运行。

- `pnpm dev`: 启动所有应用的开发模式。
- `pnpm build`: 构建所有应用和包。
- `pnpm lint`: 检查所有代码。
- `pnpm test`: 运行所有测试。

## 🤝 贡献

欢迎提交 PRs！请在提交前确保代码通过 lint 和 test 检查。

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。
```

### README 写作建议

*   **使用 Badges**: 开头的徽章能快速展示项目状态，显得很专业。
*   **清晰的特性列表**: 用 emoji 突出重点，让读者一眼就能看到项目的亮点。
*   **技术栈表格**: 直观地展示你用了什么。
*   **“快速开始”是核心**: 这一部分必须是**可复制、可执行**的，确保新人能用最少的步骤把项目跑起来。
*   **提供核心命令**: 告诉用户如何开发、构建、测试。

遵循这个结构，你的 README 将会非常专业和受欢迎。