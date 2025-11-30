import { Injectable, OnModuleInit } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { register, Counter, Histogram, Gauge, Registry } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger: PinoLogger

  // HTTP 请求计数器
  private readonly httpRequestsTotal: Counter<string>

  // HTTP 请求持续时间直方图
  private readonly httpRequestDuration: Histogram<string>

  // 活跃连接数仪表
  private readonly activeConnections: Gauge<string>

  // 自定义业务指标
  private readonly businessOperationsTotal: Counter<string>

  constructor(logger: PinoLogger) {
    this.logger = logger
    this.logger.setContext('MetricsService')
    // 创建 HTTP 请求计数器
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    })

    // 创建 HTTP 请求持续时间直方图
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    })

    // 创建活跃连接数仪表
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [register],
    })

    // 创建业务操作计数器
    this.businessOperationsTotal = new Counter({
      name: 'business_operations_total',
      help: 'Total number of business operations',
      labelNames: ['operation', 'status'],
      registers: [register],
    })
  }

  onModuleInit() {
    this.logger.info('Metrics service initialized')
  }

  // 记录 HTTP 请求
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
    }

    this.httpRequestsTotal.inc(labels)
    this.httpRequestDuration.observe(labels, duration / 1000) // 转换为秒
  }

  // 增加活跃连接数
  incrementActiveConnections(): void {
    this.activeConnections.inc()
  }

  // 减少活跃连接数
  decrementActiveConnections(): void {
    this.activeConnections.dec()
  }

  // 记录业务操作
  recordBusinessOperation(operation: string, status: 'success' | 'error'): void {
    this.businessOperationsTotal.inc({ operation, status })
  }

  // 获取所有指标
  getMetrics(): Promise<string> {
    return register.metrics()
  }

  // 获取注册表
  getRegistry(): Registry {
    return register
  }

  // 清除所有指标
  clearMetrics(): void {
    register.clear()
  }
}
