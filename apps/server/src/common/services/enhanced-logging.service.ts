import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClsService } from 'nestjs-cls'

export interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  method?: string
  url?: string
  userAgent?: string
  ip?: string
  apiVersion?: string
  duration?: number
  statusCode?: number
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  context?: string
  data?: any
  timestamp: string
  contextInfo?: LogContext
  tags?: string[]
}

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: string
  metadata?: Record<string, any>
}

@Injectable()
export class EnhancedLoggingService {
  private readonly logger = new Logger(EnhancedLoggingService.name)
  private readonly performanceMetrics: PerformanceMetrics[] = []
  private readonly maxMetrics = 1000

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService
  ) {}

  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: Error, data?: any, context?: string): void {
    const errorData = {
      ...data,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }

    this.log('error', message, errorData, context)
  }

  fatal(message: string, error?: Error, data?: any, context?: string): void {
    const errorData = {
      ...data,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    }

    this.log('fatal', message, errorData, context)
  }

  logOperation(operation: string, startTime: number, metadata?: Record<string, any>): void {
    const duration = Date.now() - startTime
    const metrics: PerformanceMetrics = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    }

    this.storePerformanceMetrics(metrics)

    // 如果操作时间过长，记录警告
    const slowThreshold = this.configService.get<number>('SLOW_OPERATION_THRESHOLD') || 1000
    if (duration > slowThreshold) {
      this.warn(
        `Slow operation detected: ${operation}`,
        { duration, threshold: slowThreshold, ...metadata },
        'Performance'
      )
    }

    this.debug(`Operation completed: ${operation}`, { duration, ...metadata }, 'Performance')
  }

  logUserAction(action: string, data?: any): void {
    const userId = this.cls.get('userId')
    const sessionId = this.cls.get('sessionId')

    this.info(
      `User action: ${action}`,
      {
        action,
        userId,
        sessionId,
        ...data,
      },
      'UserAction'
    )
  }

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    data?: any
  ): void {
    const securityData = {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ip: this.cls.get('ip'),
      userAgent: this.cls.get('userAgent'),
      userId: this.cls.get('userId'),
      ...data,
    }

    this.warn(`Security event: ${event}`, securityData, 'Security')

    // 高严重性事件需要特殊处理
    if (severity === 'high' || severity === 'critical') {
      this.error(`Critical security event: ${event}`, undefined, securityData, 'Security')
    }
  }

  logBusinessEvent(event: string, data?: any): void {
    this.info(
      `Business event: ${event}`,
      {
        event,
        timestamp: new Date().toISOString(),
        ...data,
      },
      'Business'
    )
  }

  getPerformanceStats(): {
    totalOperations: number
    averageDuration: number
    slowestOperations: PerformanceMetrics[]
    operationsByType: Record<string, { count: number; avgDuration: number }>
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperations: [],
        operationsByType: {},
      }
    }

    const totalDuration = this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration = totalDuration / this.performanceMetrics.length

    // 按类型分组统计
    const operationsByType: Record<string, PerformanceMetrics[]> = {}
    this.performanceMetrics.forEach((metric) => {
      if (!operationsByType[metric.operation]) {
        operationsByType[metric.operation] = []
      }
      operationsByType[metric.operation].push(metric)
    })

    const statsByType: Record<string, { count: number; avgDuration: number }> = {}
    Object.entries(operationsByType).forEach(([operation, metrics]) => {
      const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0)
      statsByType[operation] = {
        count: metrics.length,
        avgDuration: totalDuration / metrics.length,
      }
    })

    // 获取最慢的操作
    const slowestOperations = [...this.performanceMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      totalOperations: this.performanceMetrics.length,
      averageDuration,
      slowestOperations,
      operationsByType: statsByType,
    }
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics.length = 0
    this.logger.log('Performance metrics cleared')
  }

  private log(level: string, message: string, data?: any, context?: string): void {
    const logEntry: LogEntry = {
      level: level as any,
      message,
      data,
      timestamp: new Date().toISOString(),
      context: context || 'Application',
      contextInfo: this.buildLogContext(),
      tags: this.generateTags(level, context),
    }

    // 根据环境决定日志输出方式
    if (this.isProduction()) {
      // 生产环境：结构化日志
      this.logger.log(JSON.stringify(logEntry))
    } else {
      // 开发环境：美化输出
      this.logger.log(`[${logEntry.level.toUpperCase()}] ${logEntry.message}`, {
        ...logEntry.data,
        context: logEntry.contextInfo,
      })
    }
  }

  private buildLogContext(): LogContext {
    return {
      requestId: this.cls.get('requestId'),
      userId: this.cls.get('userId'),
      sessionId: this.cls.get('sessionId'),
      method: this.cls.get('method'),
      url: this.cls.get('url'),
      userAgent: this.cls.get('userAgent'),
      ip: this.cls.get('ip'),
      apiVersion: this.cls.get('apiVersion'),
    }
  }

  private generateTags(level: string, context?: string): string[] {
    const tags: string[] = []

    tags.push(`level:${level}`)

    if (context) {
      tags.push(`context:${context}`)
    }

    const userId = this.cls.get('userId')
    if (userId) {
      tags.push('user-authenticated')
    }

    const apiVersion = this.cls.get('apiVersion')
    if (apiVersion) {
      tags.push(`version:${apiVersion}`)
    }

    return tags
  }

  private storePerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics)

    // 限制指标数量，避免内存泄漏
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics.splice(0, this.performanceMetrics.length - this.maxMetrics)
    }
  }

  private isProduction(): boolean {
    const env = this.configService.get<string>('NODE_ENV')
    return env === 'production'
  }
}
