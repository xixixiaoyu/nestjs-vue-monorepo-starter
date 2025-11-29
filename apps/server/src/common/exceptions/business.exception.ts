import { HttpException, HttpStatus } from '@nestjs/common'

export class BusinessException extends HttpException {
  constructor(
    message: string,
    public errorCode: string,
    public statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super({ message, errorCode, statusCode }, statusCode)
  }
}

export class NotFoundException extends BusinessException {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', HttpStatus.NOT_FOUND)
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', HttpStatus.FORBIDDEN)
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST)
  }
}

export class BadRequestException extends BusinessException {
  constructor(message: string) {
    super(message, 'BAD_REQUEST', HttpStatus.BAD_REQUEST)
  }
}

export class ConflictException extends BusinessException {
  constructor(message: string) {
    super(message, 'CONFLICT', HttpStatus.CONFLICT)
  }
}

export class InternalServerErrorException extends BusinessException {
  constructor(message: string = 'Internal server error') {
    super(message, 'INTERNAL_ERROR', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
