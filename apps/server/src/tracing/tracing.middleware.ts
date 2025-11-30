import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { TracingService } from './tracing.service'

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TracingMiddleware.name)

  constructor(private readonly tracingService: TracingService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // 从请求头中提取追踪信息
    const traceHeader = req.headers['x-trace-id'] as string
    const spanHeader = req.headers['x-span-id'] as string

    let spanId: string | undefined

    if (traceHeader && spanHeader) {
      // 如果请求头中有追踪信息，使用它们
      const traceContext = this.tracingService.extractTraceFromHeader(
        `${traceHeader}-${spanHeader}`
      )
      if (traceContext) {
        const span = this.tracingService.startSpan(`${req.method} ${req.path}`, traceContext.spanId)
        spanId = span.spanId
      }
    } else {
      // 否则创建新的 span
      const span = this.tracingService.startSpan(`${req.method} ${req.path}`)
      spanId = span.spanId
    }

    // 添加追踪响应头
    if (spanId) {
      const traceId = this.tracingService.getCurrentTraceId()
      if (traceId) {
        res.setHeader('X-Trace-Id', traceId)
        res.setHeader('X-Span-Id', spanId)
      }
    }

    // 监听响应完成事件
    const originalSend = res.send
    const tracingService = this.tracingService
    res.send = function (this: Response, body?: any) {
      if (spanId) {
        // 记录响应信息
        tracingService.addTag(spanId, 'http.status_code', res.statusCode.toString())
        tracingService.addTag(spanId, 'http.method', req.method)
        tracingService.addTag(spanId, 'http.url', req.url)
        tracingService.addTag(spanId, 'http.user_agent', req.headers['user-agent'] || 'unknown')

        // 根据状态码设置 span 状态
        const status = res.statusCode >= 400 ? 'error' : 'ok'
        tracingService.finishSpan(spanId, status)
      }

      return originalSend.call(this, body)
    } as any

    // 监听响应错误事件
    res.on('error', (error) => {
      if (spanId) {
        tracingService.setError(spanId, error)
        tracingService.finishSpan(spanId, 'error')
      }
    })

    // 监听连接关闭事件
    res.on('close', () => {
      if (spanId && !res.headersSent) {
        tracingService.finishSpan(spanId, 'cancelled')
      }
    })

    next()
  }
}
