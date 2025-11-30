import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClsService } from 'nestjs-cls'

export interface Span {
  traceId: string
  spanId: string
  parentSpanId?: string
  operationName: string
  startTime: number
  endTime?: number
  duration?: number
  tags: Record<string, string>
  logs: Array<{
    timestamp: number
    level: string
    message: string
    data?: any
  }>
  status: 'ok' | 'error' | 'cancelled'
  service: string
  resource?: string
}

export interface TraceContext {
  traceId: string
  spanId: string
  baggage?: Record<string, string>
}

@Injectable()
export class TracingService {
  private readonly logger = new Logger(TracingService.name)
  private readonly activeSpans = new Map<string, Span>()
  private readonly serviceName: string

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService
  ) {
    this.serviceName = this.configService.get<string>('SERVICE_NAME') || 'nest-vue-template'
  }

  startSpan(operationName: string, parentSpanId?: string): Span {
    const traceId = this.getOrCreateTraceId()
    const spanId = this.generateSpanId()

    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: [],
      status: 'ok',
      service: this.serviceName,
    }

    this.activeSpans.set(spanId, span)
    this.setTraceContext({ traceId, spanId })

    this.logger.debug(
      `Span started: ${operationName}`,
      {
        traceId,
        spanId,
        parentSpanId,
      },
      'Tracing'
    )

    return span
  }

  finishSpan(spanId: string, status: 'ok' | 'error' | 'cancelled' = 'ok'): void {
    const span = this.activeSpans.get(spanId)
    if (!span) {
      this.logger.warn(`Attempted to finish non-existent span: ${spanId}`)
      return
    }

    span.endTime = Date.now()
    span.duration = span.endTime - span.startTime
    span.status = status

    this.logger.debug(
      `Span finished: ${span.operationName}`,
      {
        traceId: span.traceId,
        spanId: span.spanId,
        duration: span.duration,
        status,
      },
      'Tracing'
    )

    // 发送到外部追踪系统（如果配置了）
    this.sendSpanToExternalSystem(span)

    // 清理活跃的 span
    this.activeSpans.delete(spanId)
  }

  addTag(spanId: string, key: string, value: string): void {
    const span = this.activeSpans.get(spanId)
    if (span) {
      span.tags[key] = value
    }
  }

  addLog(spanId: string, level: string, message: string, data?: any): void {
    const span = this.activeSpans.get(spanId)
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        level,
        message,
        data,
      })
    }
  }

  setError(spanId: string, error: Error): void {
    const span = this.activeSpans.get(spanId)
    if (span) {
      span.status = 'error'
      this.addTag(spanId, 'error', 'true')
      this.addTag(spanId, 'error.message', error.message)
      this.addTag(spanId, 'error.stack', error.stack || '')
      this.addLog(spanId, 'error', error.message, { stack: error.stack })
    }
  }

  getCurrentTraceId(): string | undefined {
    return this.cls.get('traceId')
  }

  getCurrentSpanId(): string | undefined {
    return this.cls.get('spanId')
  }

  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values())
  }

  createTraceHeader(): string {
    const traceId = this.getCurrentTraceId()
    const spanId = this.getCurrentSpanId()

    if (!traceId || !spanId) {
      return ''
    }

    return `${traceId}-${spanId}`
  }

  extractTraceFromHeader(header: string): { traceId: string; spanId: string } | null {
    const parts = header.split('-')
    if (parts.length !== 2) {
      return null
    }

    return {
      traceId: parts[0],
      spanId: parts[1],
    }
  }

  private getOrCreateTraceId(): string {
    // 首先检查 CLS 中是否有 traceId
    let traceId = this.cls.get('traceId')

    if (!traceId) {
      // 如果没有，生成新的 traceId
      traceId = this.generateTraceId()
      this.cls.set('traceId', traceId)
    }

    return traceId
  }

  private setTraceContext(context: TraceContext): void {
    this.cls.set('traceId', context.traceId)
    this.cls.set('spanId', context.spanId)

    // 设置 baggage 用于跨服务传递
    if (context.baggage) {
      Object.entries(context.baggage).forEach(([key, value]) => {
        this.cls.set(`baggage.${key}`, value)
      })
    }
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendSpanToExternalSystem(span: Span): Promise<void> {
    try {
      // 这里可以集成外部追踪系统，如 Jaeger、Zipkin 等
      const externalTracingUrl = this.configService.get<string>('TRACING_ENDPOINT')

      if (externalTracingUrl && this.shouldSendSpan(span)) {
        // 示例：发送到外部系统
        // await fetch(externalTracingUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //   traceId: span.traceId,
        //   spanId: span.spanId,
        //   parentSpanId: span.parentSpanId,
        //   operationName: span.operationName,
        //   startTime: new Date(span.startTime).toISOString(),
        //   endTime: span.endTime ? new Date(span.endTime).toISOString() : undefined,
        //   duration: span.duration,
        //   tags: span.tags,
        //   logs: span.logs,
        //   status: span.status,
        //   service: span.service,
        //   resource: span.resource,
        // }),
        // })
      }
    } catch (error) {
      this.logger.error('Failed to send span to external tracing system', error)
    }
  }

  private shouldSendSpan(span: Span): boolean {
    // 只发送完成的 span
    return span.endTime !== undefined && span.duration !== undefined
  }
}
