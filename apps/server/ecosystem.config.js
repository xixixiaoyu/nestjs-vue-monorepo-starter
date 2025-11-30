module.exports = {
  apps: [
    {
      name: 'nestjs-api',
      // 脚本入口路径
      script: 'dist/main.js',
      // 启用集群模式，利用多核 CPU
      // 'max' 表示根据 CPU 核心数自动设置实例数量
      instances: 'max',
      // 启用 exec_mode 为 cluster，以支持负载均衡
      exec_mode: 'cluster',
      // 内存限制重启，当内存使用超过 1GB 时自动重启
      // 防止内存泄漏导致的服务不可用
      max_memory_restart: '1G',
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 日志配置
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启配置
      autorestart: true,
      // 监听文件变化（生产环境建议关闭）
      watch: false,
      // 最大内存限制
      max_restarts: 10,
      // 重启间隔时间（毫秒）
      min_uptime: '10s',
      // 进程重启延迟时间
      restart_delay: 4000,
      // 优雅关闭超时时间
      kill_timeout: 5000,
      // 进程名称前缀
      name_prefix: 'prod-',
      // 合并日志
      merge_logs: true,
      // 时间戳
      time: true,
    },
  ],
}
