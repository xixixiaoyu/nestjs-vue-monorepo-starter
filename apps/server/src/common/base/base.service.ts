import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Logger, ServiceUnavailableException } from '@nestjs/common'
import {
  BusinessBadRequestException,
  BusinessConflictException,
  BusinessInternalServerErrorException,
  BusinessUnauthorizedException,
  BusinessForbiddenException,
} from '../exceptions/business.exception'

export abstract class BaseService {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly configService: ConfigService
  ) {}

  protected get isDatabaseConfigured(): boolean {
    return Boolean(this.configService.get<string>('DATABASE_URL'))
  }

  protected handleDatabaseError(error: any): never {
    this.logError('Database error', error)

    // 根据错误类型抛出不同的异常
    if (error?.code === 'P2002') {
      // Prisma 唯一约束违反
      throw new BusinessConflictException('数据已存在，请检查唯一性约束')
    } else if (error?.code === 'P2025') {
      // Prisma 记录未找到
      throw new BusinessBadRequestException('请求的数据不存在')
    } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
      // 数据库连接被拒绝
      throw new ServiceUnavailableException('数据库服务不可用，请稍后重试')
    } else if (error?.message?.includes('timeout')) {
      // 超时错误
      throw new ServiceUnavailableException('数据库操作超时，请稍后重试')
    } else {
      // 其他数据库错误
      throw new BusinessInternalServerErrorException('数据库操作失败，请联系管理员')
    }
  }

  protected handleValidationError(message: string): never {
    this.logError('Validation error', message)
    throw new BusinessBadRequestException(`验证失败: ${message}`)
  }

  protected handleNotFoundError(resource: string = '资源'): never {
    this.logError('Not found error', `${resource} not found`)
    throw new BusinessBadRequestException(`${resource}不存在`)
  }

  protected handleUnauthorizedError(message: string = '未授权访问'): never {
    this.logError('Unauthorized error', message)
    throw new BusinessUnauthorizedException(message)
  }

  protected handleForbiddenError(message: string = '权限不足'): never {
    this.logError('Forbidden error', message)
    throw new BusinessForbiddenException(message)
  }

  protected logError(message: string, error: any): void {
    // 记录详细的错误信息
    const errorDetails = {
      message: error?.message || error,
      stack: error?.stack,
      code: error?.code,
      timestamp: new Date().toISOString(),
    }
    this.logger.error(message, errorDetails)
  }

  protected logInfo(message: string, data?: any): void {
    const logData = {
      data,
      timestamp: new Date().toISOString(),
    }
    this.logger.log(message, logData)
  }

  protected logWarning(message: string, data?: any): void {
    const logData = {
      data,
      timestamp: new Date().toISOString(),
    }
    this.logger.warn(message, logData)
  }

  protected logDebug(message: string, data?: any): void {
    const logData = {
      data,
      timestamp: new Date().toISOString(),
    }
    this.logger.debug(message, logData)
  }
}
