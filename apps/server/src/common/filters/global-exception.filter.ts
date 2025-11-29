import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import type { ApiError } from '@shared-types'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let error: string | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any
        message = responseObj.message || responseObj.error || message
        error = responseObj.error
      }
    } else if (exception instanceof Error) {
      message = exception.message
    }

    // 构建标准化的错误响应
    const errorResponse: ApiError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    }

    // 记录错误日志
    this.logError(exception, request, errorResponse)

    // 发送错误响应
    response.status(status).json(errorResponse)
  }

  private logError(exception: unknown, request: Request, errorResponse: ApiError) {
    const logData = {
      level: 'error',
      message: 'Unhandled exception',
      statusCode: errorResponse.statusCode,
      path: errorResponse.path,
      method: request.method,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      body: request.body,
      exception: {
        name: exception instanceof Error ? exception.name : 'Unknown',
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      timestamp: errorResponse.timestamp,
    }

    if (errorResponse.statusCode >= 500) {
      this.logger.error(JSON.stringify(logData, null, 2))
    } else {
      this.logger.warn(JSON.stringify(logData, null, 2))
    }
  }
}
