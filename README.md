# Nest + Vue Monorepo Template

一个采用 Turborepo 的 **NestJS + Vue 3** 单仓库模板，内置 TypeScript、ESLint、Husky、Commitlint 等工程化工具。前端采用 **Shadcn-vue** 风格组件与 **Tailwind CSS**，后端采用 **NestJS + Prisma**。

## 目录结构
- `apps/web`：Vue 3 + Vite，使用 Shadcn-vue 风格组件与 Tailwind
- `apps/server`：NestJS + Prisma + PostgreSQL（可切换到其他数据库）
- `packages/eslint-config-custom`：统一 ESLint 配置
- `packages/shared-types` / `packages/types`：共享类型定义
- `packages/tsconfig`：统一 tsconfig 基座

## 技术栈
- 前端：`Vue 3`、`Vite`、`Tailwind CSS`、`radix-vue`、`lucide-vue-next`、`class-variance-authority`、`clsx`、`tailwind-merge`
- 组件：`shadcn-vue` CLI 生成组件骨架，样式走 Tailwind 原子类
- 后端：`NestJS`、`Prisma`、`@nestjs/config`、`class-validator`
- 工程：`pnpm`、`Turborepo`、`ESLint`、`Prettier`、`Husky`、`Commitlint`

## 快速开始
1) 安装依赖

```bash
pnpm install
```

2) 启动数据库（可选）

```bash
docker compose up -d
```

3) 生成 Prisma Client（如使用数据库）

```bash
pnpm --filter @server prisma:generate
```

4) 开发模式

```bash
pnpm run dev
```

- 前端：`http://localhost:5173/`
- 后端：`http://localhost:3001/`

5) 构建与校验

```bash
pnpm run typecheck
pnpm run build
pnpm run lint
```

## 前端说明（apps/web）
- 入口：`src/main.ts`
- 全局样式与主题变量：`src/assets/main.css`
- 组件目录：`src/components/ui/`
- 组件聚合导出：`src/components/ui/index.ts`
- 工具方法：`src/lib/utils.ts`（`cn` 合并类名、`valueUpdater` 更新 ref 值）
- Tailwind 配置：`tailwind.config.js`（包含 `tailwindcss-animate`）
- Shadcn-vue 配置：`components.json`

### Shadcn-vue 组件使用
- 通过 CLI 添加组件（在 `apps/web` 下执行）：

```bash
pnpm dlx shadcn-vue@latest init -y
pnpm dlx shadcn-vue@latest add button card input alert -y -p src/components/ui
pnpm dlx shadcn-vue@latest add dialog dropdown-menu tabs toast textarea select badge avatar skeleton switch toggle tooltip separator -y -p src/components/ui
```

- 导入方式（聚合导出）：

```ts
import { Button, Card, Input, Alert } from '@/components/ui'
```

### 风格与主题
- 使用 `components.json` 的 `style: new-york` 与 `baseColor: neutral`
- 所有颜色通过 `:root` CSS 变量定义（`src/assets/main.css`），支持 `.dark` 暗色模式

## 后端说明（apps/server）
- 入口：`src/main.ts`
- 模块：`src/app.module.ts`
- 健康检查：`src/app.controller.ts` / `src/app.service.ts`
- 用户模块：`src/users/*`
- Prisma：
  - 数据模型：`prisma/schema.prisma`
  - 服务：`src/prisma/prisma.service.ts`
- 环境变量样例：`.env.example`

## 脚本（根目录）
- `dev`：`turbo run dev`
- `build`：`turbo run build`
- `typecheck`：`turbo run typecheck`
- `lint`：`turbo run lint`
- `lint:root`：在根运行 ESLint（使用共享配置）
- `prepare`：安装 Husky 钩子

## 代码风格约定
- JS / TS：单引号、无分号、两空格缩进
- 引入路径使用别名：`@/components`、`@/lib`、`@/components/ui`
- 前端变更需执行：`pnpm --filter @web run typecheck && pnpm --filter @web run build`
- 后端变更需执行：`pnpm --filter @server run build`

## 常见问题
- 大小写文件名冲突：在 `macOS` 下需避免同目录同时存在大小写不同的文件名（TypeScript 会报 `TS1261`）。
- Shadcn-vue 导出缺失：如果 `src/components/ui/index.ts` 未导出新组件所需的 `variants` 或 `types`，需补全或使用 CLI 重新生成。

## 贡献指南
- 分支策略与提交规范遵循 `Commitlint` 约定式提交。
- 新增包或子应用时，遵守 `packages/tsconfig` 与 `packages/eslint-config-custom` 的约束。

## 变更记录
- 近期：
  - 前端组件库迁移到 Shadcn-vue 风格，统一聚合导出与 variants。
  - Tailwind 加入 `tailwindcss-animate`，暗色与主题变量完善。
  - 根脚本补充 `lint:root`，统一工程化体验。

