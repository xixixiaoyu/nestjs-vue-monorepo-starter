# Docker Compose 最佳实践指南

## 📁 目录结构

```
docker/
├── .env.example              # 环境变量配置示例
├── README.md                 # 本文档
└── compose/
    ├── docker-compose.base.yml    # 基础服务（数据库、Redis）
    ├── docker-compose.dev.yml     # 开发环境配置
    ├── docker-compose.prod.yml    # 生产环境配置
    └── docker-compose.ci.yml      # CI/CD 环境配置
```

## 🎯 设计原则

### 1. 分离关注点
- **base.yml**: 基础服务，所有环境共享
- **dev.yml**: 开发环境特定配置
- **prod.yml**: 生产环境特定配置
- **ci.yml**: CI/CD 环境特定配置

### 2. 环境变量驱动
- 所有配置通过环境变量控制
- 支持不同环境的差异化配置
- 敏感信息不硬编码在配置文件中

### 3. 可扩展性
- 使用 profiles 管理可选服务
- 支持服务扩容和负载均衡
- 资源限制和健康检查

## 🚀 使用方法

### 开发环境

```bash
# 复制环境变量配置
cp docker/.env.example docker/.env

# 启动开发环境（包含基础服务 + 开发配置）
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.dev.yml \
               up -d --build

# 启动开发工具（可选）
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.dev.yml \
               --profile tools up -d

# 查看日志
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.dev.yml \
               logs -f server

# 停止服务
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.dev.yml \
               down
```

### 生产环境

```bash
# 配置生产环境变量
cp docker/.env.example docker/.env.prod
# 编辑 .env.prod 文件，设置生产环境配置

# 启动生产环境
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               --env-file docker/.env.prod \
               up -d --build

# 启用 Nginx 反向代理（可选）
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               --env-file docker/.env.prod \
               --profile nginx up -d

# 扩容服务
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               --env-file docker/.env.prod \
               up -d --scale server=3

# 滚动更新
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               --env-file docker/.env.prod \
               up -d --no-deps server
```

### CI/CD 环境

```bash
# 运行测试
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.ci.yml \
               --profile testing up --build --abort-on-container-exit

# 运行代码质量检查
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.ci.yml \
               --profile quality up --build --abort-on-container-exit

# 完整的 CI 流程
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.ci.yml \
               --profile testing --profile quality up --build --abort-on-container-exit
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `COMPOSE_PROJECT_NAME` | 项目名称前缀 | `nest-vue` | `my-app` |
| `DB_NAME` | 数据库名称 | `appdb` | `production_db` |
| `DB_USER` | 数据库用户名 | `postgres` | `app_user` |
| `DB_PASSWORD` | 数据库密码 | - | `secure_password` |
| `JWT_SECRET` | JWT 密钥 | - | `super_secret_key` |
| `CORS_ORIGINS` | CORS 允许的源 | - | `https://example.com` |

### Profiles

- **tools**: 开发工具（Adminer、Redis Commander）
- **nginx**: Nginx 反向代理（生产环境）
- **testing**: 测试运行器
- **quality**: 代码质量检查

### 资源限制

生产环境默认配置资源限制：

- **Server**: 1 CPU, 1GB 内存
- **Web**: 0.5 CPU, 256MB 内存
- **Nginx**: 0.5 CPU, 256MB 内存

可通过环境变量调整：
```bash
SERVER_CPU_LIMIT=2.0
SERVER_MEMORY_LIMIT=2G
```

## 🛠️ 最佳实践

### 1. 安全配置

```bash
# 生成强密码
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)

# 生产环境安全设置
DB_PORT=  # 留空表示不暴露端口到主机
REDIS_PORT=  # 留空表示不暴露端口到主机

# 确保 CORS 配置正确
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. 生产环境部署检查清单

- [ ] 更改所有默认密码
- [ ] 设置正确的 CORS 域名
- [ ] 不暴露数据库和 Redis 端口
- [ ] 配置 SSL 证书
- [ ] 设置资源限制
- [ ] 启用日志轮转

### 2. 日志管理

```bash
# 配置日志轮转
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. 健康检查

所有服务都配置了健康检查：
- **数据库**: `pg_isready`
- **Redis**: `redis-cli ping`
- **应用**: HTTP 健康检查端点

### 4. 网络隔离

使用自定义网络隔离服务：
```yaml
networks:
  app-network:
    driver: bridge
    name: ${COMPOSE_PROJECT_NAME}-network
```

## 🔄 迁移指南

### 从旧的 docker-compose.yml 迁移

1. **备份现有配置**
```bash
cp docker-compose.yml docker-compose.yml.backup
```

2. **复制环境变量**
```bash
cp docker/.env.example docker/.env
# 根据旧配置修改 .env 文件
```

3. **使用新的启动方式**
```bash
# 开发环境
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.dev.yml \
               up -d --build

# 生产环境
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               up -d --build
```

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   
   # 修改环境变量中的端口配置
   SERVER_PORT=3001
   ```

2. **权限问题**
   ```bash
   # 确保日志目录权限正确
   mkdir -p docker/compose/logs
   chmod 755 docker/compose/logs
   ```

3. **依赖服务启动失败**
   ```bash
   # 检查服务健康状态
   docker-compose -f docker/compose/docker-compose.base.yml \
                  -f docker/compose/docker-compose.dev.yml \
                  ps
   
   # 查看详细日志
   docker-compose -f docker/compose/docker-compose.base.yml \
                  -f docker/compose/docker-compose.dev.yml \
                  logs postgres
   ```

### 调试命令

```bash
# 进入容器调试
docker exec -it nest-vue-server-dev sh

# 查看容器资源使用
docker stats nest-vue-server-prod

# 查看容器详细信息
docker inspect nest-vue-server-prod

# 重建特定服务
docker-compose -f docker/compose/docker-compose.base.yml \
               -f docker/compose/docker-compose.prod.yml \
               up -d --build server
```

## 📚 参考资料

- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Docker Compose 最佳实践](https://docs.docker.com/compose/compose-file/compose-file-v3/)
- [环境变量替换](https://docs.docker.com/compose/environment-variables/)
- [使用 Profiles](https://docs.docker.com/compose/profiles/)