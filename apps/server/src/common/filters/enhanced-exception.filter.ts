import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { ClsService } from 'nestjs-cls'
import { ErrorTrackingService } from '../services/error-tracking.service'
import { EnhancedLoggingService } from '../services/enhanced-logging.service'

@Catch()
export class EnhancedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnhancedExceptionFilter.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
    private readonly errorTracking: ErrorTrackingService,
    private readonly loggingService: EnhancedLoggingService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // 设置上下文信息
    this.setContextInfo(request)

    const errorId = this.handleError(exception, request)

    // 构建错误响应
    const errorResponse = this.buildErrorResponse(exception, errorId)

    // 记录错误
    this.logError(exception, request, errorId)

    // 发送响应
    response.status(errorResponse.statusCode).json(errorResponse.body)
  }

  private setContextInfo(request: Request): void {
    this.cls.set('method', request.method)
    this.cls.set('url', request.url)
    this.cls.set('userAgent', request.headers['user-agent'])
    this.cls.set('ip', this.getClientIp(request))
    this.cls.set('apiVersion', (request as any).apiVersion)
  }

  private handleError(exception: unknown, request: Request): string {
    if (exception instanceof HttpException) {
      // HTTP 异常
      const errorId = this.errorTracking.trackError(
        exception as Error,
        {
          method: request.method,
          url: request.url,
        } as any
      )

      this.loggingService.warn(
        `HTTP Exception: ${exception.message}`,
        {
          statusCode: exception.getStatus(),
          errorId,
        },
        'HttpException'
      )

      return errorId
    } else if (exception instanceof Error) {
      // 一般错误
      const errorId = this.errorTracking.trackError(exception, {
        method: request.method,
        url: request.url,
      })

      this.loggingService.error(
        `Unhandled Exception: ${exception.message}`,
        exception,
        { errorId },
        'UnhandledException'
      )

      return errorId
    } else {
      // 未知异常
      const error = new Error('Unknown exception occurred')
      error.stack = JSON.stringify(exception)

      const errorId = this.errorTracking.trackError(error, {
        method: request.method,
        url: request.url,
      })

      this.loggingService.fatal(
        `Unknown Exception: ${JSON.stringify(exception)}`,
        error,
        { errorId },
        'UnknownException'
      )

      return errorId
    }
  }

  private buildErrorResponse(
    exception: unknown,
    errorId: string
  ): {
    statusCode: number
    body: any
  } {
    const isProduction = this.isProduction()

    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      const status = exception.getStatus()

      if (typeof response === 'string') {
        return {
          statusCode: status,
          body: {
            success: false,
            error: {
              id: errorId,
              message: response,
              code: this.getErrorCode(exception),
              timestamp: new Date().toISOString(),
            },
            ...(isProduction ? {} : { stack: exception.stack }),
          },
        }
      }

      return {
        statusCode: status,
        body: {
          success: false,
          error: {
            id: errorId,
            ...(response as any),
            timestamp: new Date().toISOString(),
          },
          ...(isProduction ? {} : { stack: exception.stack }),
        },
      }
    }

    // 非 HTTP 异常
    const statusCode = this.getStatusCode(exception)
    const message = this.getErrorMessage(exception)

    return {
      statusCode,
      body: {
        success: false,
        error: {
          id: errorId,
          message,
          code: this.getErrorCode(exception),
          timestamp: new Date().toISOString(),
        },
        ...(isProduction ? {} : { stack: (exception as Error)?.stack }),
      },
    }
  }

  private logError(exception: unknown, request: Request, errorId: string): void {
    const logData = {
      errorId,
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      query: request.query,
      params: request.params,
      body: this.sanitizeBody(request.body),
      userAgent: request.headers['user-agent'],
      ip: this.getClientIp(request),
      apiVersion: (request as any).apiVersion,
    }

    this.logger.error('Exception caught', {
      exception: {
        name: (exception as Error)?.name,
        message: (exception as Error)?.message,
        stack: (exception as Error)?.stack,
      },
      request: logData,
    })
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }

    if (exception instanceof Error) {
      switch (exception.name) {
        case 'ValidationError':
          return HttpStatus.BAD_REQUEST
        case 'UnauthorizedError':
          return HttpStatus.UNAUTHORIZED
        case 'ForbiddenError':
          return HttpStatus.FORBIDDEN
        case 'NotFoundError':
          return HttpStatus.NOT_FOUND
        case 'ConflictError':
          return HttpStatus.CONFLICT
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      if (typeof response === 'string') {
        return response
      }
      return (response as any)?.message || exception.message
    }

    if (exception instanceof Error) {
      return exception.message
    }

    return 'Internal server error'
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      return (exception as any).code || 'HTTP_EXCEPTION'
    }

    if (exception instanceof Error) {
      return exception.name.toUpperCase()
    }

    return 'UNKNOWN_ERROR'
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    )
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized: any = {}

    Object.keys(headers).forEach((key) => {
      // 过滤敏感头信息
      if (!this.isSensitiveHeader(key)) {
        sanitized[key] = headers[key]
      }
    })

    return sanitized
  }

  private sanitizeBody(body: any): any {
    if (!body) return body

    try {
      const bodyStr = JSON.stringify(body)
      const sanitized = bodyStr.replace(/("password":\s*")[^"]*"/g, '"password":"[REDACTED]"')
      return JSON.parse(sanitized)
    } catch {
      return '[REDACTED]'
    }
  }

  private isSensitiveHeader(key: string): boolean {
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-auth-token']

    return sensitiveHeaders.includes(key.toLowerCase())
  }

  private isProduction(): boolean {
    const env = this.configService.get<string>('NODE_ENV')
    return env === 'production'
  }
}
