import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClsService } from 'nestjs-cls'

export interface ErrorContext {
  requestId?: string
  userId?: string
  method?: string
  url?: string
  userAgent?: string
  ip?: string
  apiVersion?: string
  timestamp?: string
}

export interface ErrorReport {
  id: string
  message: string
  stack?: string
  name: string
  code?: string
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  metadata?: Record<string, any>
}

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name)
  private readonly errors: ErrorReport[] = []
  private readonly maxErrors = 1000

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService
  ) {}

  trackError(error: Error, context: Partial<ErrorContext> = {}): string {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: (error as any).code,
      context: this.buildContext(context),
      severity: this.determineSeverity(error),
      tags: this.generateTags(error, context),
      metadata: this.extractMetadata(error),
    }

    // 存储错误报告
    this.storeError(errorReport)

    // 记录日志
    this.logError(errorReport)

    // 在生产环境中，可以发送到外部服务
    if (this.isProduction()) {
      this.sendToExternalService(errorReport)
    }

    return errorReport.id
  }

  trackCustomError(
    message: string,
    errorName: string = 'CustomError',
    context: Partial<ErrorContext> = {},
    metadata?: Record<string, any>
  ): string {
    const error = new Error(message)
    error.name = errorName

    if (metadata) {
      ;(error as any).metadata = metadata
    }

    return this.trackError(error, context)
  }

  getErrorStats(): {
    total: number
    bySeverity: Record<string, number>
    byName: Record<string, number>
    recent: ErrorReport[]
  } {
    const bySeverity: Record<string, number> = {}
    const byName: Record<string, number> = {}

    this.errors.forEach((error) => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
      byName[error.name] = (byName[error.name] || 0) + 1
    })

    return {
      total: this.errors.length,
      bySeverity,
      byName,
      recent: this.errors.slice(-10), // 最近 10 个错误
    }
  }

  clearErrors(): void {
    this.errors.length = 0
    this.logger.log('Error tracking cleared')
  }

  private buildContext(context: Partial<ErrorContext>): ErrorContext {
    return {
      requestId: this.cls.get('requestId'),
      userId: this.cls.get('userId'),
      method: this.cls.get('method'),
      url: this.cls.get('url'),
      userAgent: this.cls.get('userAgent'),
      ip: this.cls.get('ip'),
      apiVersion: this.cls.get('apiVersion'),
      timestamp: new Date().toISOString(),
      ...context,
    }
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorCode = (error as any).code

    // 根据错误类型和代码确定严重程度
    if (error.name === 'ValidationError') {
      return 'low'
    }

    if (error.name === 'UnauthorizedError') {
      return 'medium'
    }

    if (errorCode === 'ECONNREFUSED' || errorCode === 'ETIMEDOUT') {
      return 'high'
    }

    if (error.name === 'DatabaseError' || error.name === 'SystemError') {
      return 'critical'
    }

    return 'medium'
  }

  private generateTags(error: Error, context: Partial<ErrorContext>): string[] {
    const tags: string[] = []

    // 基于错误名称的标签
    tags.push(`error:${error.name.toLowerCase()}`)

    // 基于错误代码的标签
    const errorCode = (error as any).code
    if (errorCode) {
      tags.push(`code:${errorCode}`)
    }

    // 基于上下文的标签
    if (context.method) {
      tags.push(`method:${context.method.toLowerCase()}`)
    }

    if (context.apiVersion) {
      tags.push(`version:${context.apiVersion}`)
    }

    if (context.userId) {
      tags.push('user-affected')
    }

    return tags
  }

  private extractMetadata(error: Error): Record<string, any> {
    const metadata: Record<string, any> = {}

    // 提取自定义元数据
    if ((error as any).metadata) {
      Object.assign(metadata, (error as any).metadata)
    }

    // 提取 Prisma 错误信息
    if ((error as any).code && (error as any).clientVersion) {
      metadata.prisma = {
        code: (error as any).code,
        clientVersion: (error as any).clientVersion,
        meta: (error as any).meta,
      }
    }

    return metadata
  }

  private storeError(errorReport: ErrorReport): void {
    this.errors.push(errorReport)

    // 限制错误数量，避免内存泄漏
    if (this.errors.length > this.maxErrors) {
      this.errors.splice(0, this.errors.length - this.maxErrors)
    }
  }

  private logError(errorReport: ErrorReport): void {
    const logData = {
      errorId: errorReport.id,
      message: errorReport.message,
      name: errorReport.name,
      code: errorReport.code,
      severity: errorReport.severity,
      tags: errorReport.tags,
      context: errorReport.context,
      metadata: errorReport.metadata,
    }

    this.logger.error(`Error tracked [${errorReport.id}]`, logData)
  }

  private async sendToExternalService(_errorReport: ErrorReport): Promise<void> {
    try {
      // 这里可以集成外部错误跟踪服务，如 Sentry、Bugsnag 等
      const externalServiceUrl = this.configService.get<string>('ERROR_TRACKING_URL')

      if (externalServiceUrl) {
        // 示例：发送到外部服务
        // await fetch(externalServiceUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport),
        // })
      }
    } catch (sendError) {
      this.logger.error('Failed to send error to external service', sendError)
    }
  }

  private isProduction(): boolean {
    const env = this.configService.get<string>('NODE_ENV')
    return env === 'production'
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
