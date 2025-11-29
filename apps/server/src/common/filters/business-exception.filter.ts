import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { BusinessException } from '../exceptions/business.exception'

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name)

  catch(exception: BusinessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception.getStatus()
    const _exceptionResponse = exception.getResponse()

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      errorCode: exception.errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    }

    this.logger.error(
      JSON.stringify({
        level: 'error',
        message: 'business.exception',
        status,
        path: request.url,
        errorCode: exception.errorCode,
        stack: exception.stack,
      })
    )

    response.status(status).json(body)
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: HttpStatus
    let errorMessage: string
    let errorCode: string = 'UNKNOWN_ERROR'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      errorMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || 'Unknown error'
      errorCode = (exceptionResponse as any)?.errorCode || 'HTTP_ERROR'
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorMessage = 'Internal server error'
      errorCode = 'INTERNAL_ERROR'
    }

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
      errorCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    }

    this.logger.error(
      JSON.stringify({
        level: 'error',
        message: 'uncaught.exception',
        status,
        path: request.url,
        errorCode,
        stack: exception instanceof Error ? exception.stack : undefined,
      })
    )

    response.status(status).json(body)
  }
}
