import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { MetricsService } from './metrics.service'

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('MetricsMiddleware')

  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now()

    // 增加活跃连接数
    this.metricsService.incrementActiveConnections()

    // 监听响应完成事件
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const route = this.getRoute(req)

      // 记录 HTTP 请求指标
      this.metricsService.recordHttpRequest(req.method, route, res.statusCode, duration)

      // 减少活跃连接数
      this.metricsService.decrementActiveConnections()

      this.logger.debug(`Request: ${req.method} ${route} - ${res.statusCode} - ${duration}ms`)
    })

    next()
  }

  private getRoute(req: Request): string {
    // 尝试从路由中提取路径
    if (req.route) {
      return req.route.path
    }

    // 如果没有路由信息，使用原始 URL 路径
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    return url.pathname
  }
}
