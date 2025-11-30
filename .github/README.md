# GitHub Actions 工作流文档

本项目使用 GitHub Actions 实现全面的 CI/CD 流程，包括代码质量检查、安全扫描、测试、部署和发布等功能。

## 📋 工作流概览

### 1. CI 工作流 (`ci.yml`)
**触发条件**: 推送到 `main`/`develop` 分支，或针对这些分支的 PR

**功能**:
- 并行执行代码质量检查、类型检查、测试和构建
- 多应用构建支持（Server、Web、Desktop）
- 数据库迁移检查
- 构建产物上传
- CI 汇总报告

**作业流程**:
```
install → quality → typecheck → test → build → build-desktop → db-migration → ci-summary
```

### 2. 安全扫描工作流 (`security.yml`)
**触发条件**: 推送到 `main`/`develop` 分支、PR，或每周一自动运行

**功能**:
- 依赖漏洞扫描（pnpm audit + Snyk）
- CodeQL 代码分析
- 密钥泄露检测（TruffleHog）
- Go 模块安全扫描
- 安全汇总报告

### 3. 部署工作流 (`deploy.yml`)
**触发条件**: 推送到 `main` 分支、创建标签，或手动触发

**功能**:
- Docker 镜像构建和推送
- 多环境部署支持（Staging/Production）
- Desktop 应用构建和发布
- 部署后健康检查
- 部署通知

### 4. 发布工作流 (`release.yml`)
**触发条件**: 推送到 `main` 分支或手动触发

**功能**:
- 自动版本检测和更新
- 生成 Changelog
- 创建 GitHub Release
- NPM 包发布
- Docker 镜像发布
- 发布通知

### 5. 性能测试工作流 (`performance.yml`)
**触发条件**: 推送到 `main` 分支、PR，或每日自动运行

**功能**:
- API 负载测试和压力测试
- Web 应用性能测试（Lighthouse）
- 数据库性能基准测试
- 性能回归检测
- 性能报告生成

### 6. 通知工作流 (`notify.yml`)
**触发条件**: 其他工作流完成、状态变更、检查运行完成

**功能**:
- CI/CD 流程状态通知
- 安全问题警报
- 部署状态通知
- 发布通知
- 性能问题通知
- 每日汇总报告

### 7. 缓存工作流 (`cache.yml`)
**触发条件**: 推送到 `main`/`develop` 分支、PR，或每日自动运行

**功能**:
- Node.js 依赖缓存
- Docker 镜像层缓存
- Go 模块缓存
- Prisma 生成文件缓存
- Turbo 构建产物缓存
- 测试覆盖率数据缓存

### 8. 环境配置工作流 (`environment.yml`)
**触发条件**: 被其他工作流调用

**功能**:
- 环境变量管理
- 配置文件生成
- 工具链设置
- 环境验证

## 🔧 配置说明

### 必需的 Secrets

在 GitHub 仓库设置中配置以下 Secrets：

#### 基础配置
- `GITHUB_TOKEN`: GitHub 访问令牌（自动提供）
- `NPM_TOKEN`: NPM 发布令牌

#### 安全扫描
- `SNYK_TOKEN`: Snyk 安全扫描令牌

#### 部署配置
- `DOCKER_USERNAME`: Docker Hub 用户名
- `DOCKER_PASSWORD`: Docker Hub 密码
- `AWS_ACCESS_KEY_ID`: AWS 访问密钥 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 秘密访问密钥

#### 通知配置
- `SLACK_WEBHOOK_URL`: Slack 通知 Webhook URL
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub App 令牌

#### 应用配置
- `DATABASE_URL`: 数据库连接字符串
- `REDIS_URL`: Redis 连接字符串
- `JWT_SECRET`: JWT 密钥
- `EMAIL_HOST`: 邮件服务器主机
- `EMAIL_PORT`: 邮件服务器端口
- `EMAIL_USER`: 邮件用户名
- `EMAIL_PASS`: 邮件密码
- `SENTRY_DSN`: Sentry 错误监控 DSN
- `GOOGLE_ANALYTICS_ID`: Google Analytics ID

### 环境配置

项目支持以下环境：

#### Development
- 本地开发环境
- 使用本地数据库和 Redis
- 热重载支持

#### Staging
- 预发布环境
- 使用测试数据库和 Redis
- 自动部署

#### Production
- 生产环境
- 使用生产数据库和 Redis
- 手动或自动部署

## 🚀 使用指南

### 本地开发

1. 克隆仓库：
```bash
git clone <repository-url>
cd nest-vue-template
```

2. 安装依赖：
```bash
pnpm install
```

3. 启动开发环境：
```bash
pnpm dev
```

### 使用 Docker

1. 构建和启动所有服务：
```bash
docker-compose -f docker-compose.ci.yml up -d
```

2. 查看服务状态：
```bash
docker-compose -f docker-compose.ci.yml ps
```

3. 停止服务：
```bash
docker-compose -f docker-compose.ci.yml down
```

### 手动触发工作流

1. 进入 GitHub Actions 页面
2. 选择相应的工作流
3. 点击 "Run workflow" 按钮
4. 选择分支和参数（如果适用）

### 查看工作流状态

1. 进入 GitHub Actions 页面
2. 查看正在运行和已完成的工作流
3. 点击具体工作流查看详细日志和结果

## 📊 监控和报告

### CI 汇总
每个 CI 运行完成后会生成汇总报告，包含：
- 代码质量检查结果
- 类型检查结果
- 测试结果
- 构建结果
- 数据库迁移检查结果

### 安全报告
安全扫描完成后会生成报告，包含：
- 依赖漏洞信息
- CodeQL 分析结果
- 密钥泄露检测结果
- Go 安全扫描结果

### 性能报告
性能测试完成后会生成报告，包含：
- API 性能指标
- Web 应用性能评分
- 数据库性能基准
- 性能回归检测结果

### 通知
系统会通过以下方式发送通知：
- Slack 通知（配置 Webhook 后）
- GitHub 状态检查
- 邮件通知（配置后）
- PR 评论（性能测试结果）

## 🛠️ 自定义配置

### 修改工作流
1. 编辑 `.github/workflows/` 目录下的相应文件
2. 提交更改到仓库
3. 工作流会自动使用新配置

### 添加新的检查
1. 在相应的工作流文件中添加新的步骤
2. 配置必要的依赖和环境
3. 更新汇总报告（如果需要）

### 配置新的环境
1. 在 `environment.yml` 中添加环境配置
2. 创建相应的环境文件（`.env.<environment>`）
3. 配置必要的 Secrets
4. 更新部署配置

## 📝 最佳实践

1. **分支策略**: 使用 `main` 作为生产分支，`develop` 作为开发分支
2. **提交规范**: 遵循 Conventional Commits 规范，便于自动生成 Changelog
3. **版本管理**: 使用语义化版本控制，自动版本检测和发布
4. **安全**: 定期更新依赖，及时修复安全漏洞
5. **性能**: 定期运行性能测试，监控性能回归
6. **监控**: 配置适当的监控和告警，及时发现问题

## 🆘 故障排除

### 常见问题

1. **工作流失败**
   - 检查工作流日志
   - 验证 Secrets 配置
   - 确认依赖版本兼容性

2. **缓存问题**
   - 清除缓存：在 Actions 页面手动清除缓存
   - 更新缓存键：修改 `cache.yml` 中的缓存键

3. **部署失败**
   - 检查目标环境状态
   - 验证部署配置
   - 查看部署日志

4. **性能测试失败**
   - 检查测试环境状态
   - 验证测试配置
   - 分析性能报告

### 获取帮助

1. 查看 GitHub Actions 文档：https://docs.github.com/en/actions
2. 查看项目 Issues：在仓库中创建 Issue
3. 联系维护团队：通过邮件或 Slack

## 📚 相关资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [pnpm 文档](https://pnpm.io/)
- [Turbo 文档](https://turbo.build/)
- [Docker 文档](https://docs.docker.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [NestJS 文档](https://docs.nestjs.com/)
- [Vue.js 文档](https://vuejs.org/guide/)
- [Wails 文档](https://wails.io/docs/)