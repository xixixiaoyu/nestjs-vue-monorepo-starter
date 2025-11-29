import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as Record<string, unknown>).message ?? 'Unexpected error')

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    }

    this.logger.error(
      JSON.stringify({
        level: 'error',
        message: 'http.exception',
        status,
        path: request.url,
        stack: exception instanceof Error ? exception.stack : undefined,
      })
    )

    response.status(status).json(body)
  }
}
