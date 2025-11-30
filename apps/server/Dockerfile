# 多阶段构建 - 基础镜像
FROM node:18-alpine AS base
# 安装 pnpm
RUN npm install -g pnpm@9.12.0
# 设置工作目录
WORKDIR /app

# 多阶段构建 - 依赖安装阶段
FROM base AS deps
# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
# 安装所有依赖（包括开发依赖，用于构建阶段）
RUN pnpm install --frozen-lockfile

# 多阶段构建 - 构建阶段
FROM base AS builder
# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制源代码
COPY . .
# 生成 Prisma 客户端
RUN cd apps/server && pnpm prisma:generate
# 构建应用
RUN pnpm --filter @server build
# 构建共享类型包
RUN pnpm --filter @project/shared-types build

# 多阶段构建 - 生产环境（默认）
FROM node:18-alpine AS production
# 安装 pnpm 和 PM2
RUN npm install -g pnpm@9.12.0 pm2
# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
# 设置工作目录
WORKDIR /app
# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune
# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist
# 复制 PM2 配置文件
COPY apps/server/ecosystem.config.js ./apps/server/
# 创建日志目录
RUN mkdir -p /app/apps/server/logs && \
    chown -R nestjs:nodejs /app/apps/server/logs
# 切换到非 root 用户
USER nestjs
# 暴露端口
EXPOSE 3000
# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
# 生产环境启动命令 - 使用 pm2-runtime
# 必须使用 pm2-runtime 而不是 pm2 start，因为：
# 1. pm2-runtime 是专为容器设计的运行时，会保持前台进程运行
# 2. pm2 start 会后台运行，导致容器启动后立即退出
# 3. pm2-runtime 提供了更好的容器集成，包括信号处理和日志管理
CMD ["pm2-runtime", "start", "apps/server/ecosystem.config.js"]

# 多阶段构建 - 开发环境
FROM base AS development
# 复制所有依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制源代码
COPY . .
# 生成 Prisma 客户端
RUN cd apps/server && pnpm prisma:generate
# 暴露端口
EXPOSE 3000
# 开发环境启动命令
CMD ["pnpm", "--filter", "@server", "dev"]