import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { BusinessInternalServerErrorException } from '../exceptions/business.exception'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'
import { ClsService } from 'nestjs-cls'

@Injectable()
export class BaseService {
  protected readonly prisma: PrismaService
  protected readonly configService: ConfigService
  protected readonly isDatabaseConfigured: boolean
  protected readonly logger: PinoLogger
  protected readonly cls: ClsService

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
    @InjectPinoLogger(BaseService.name) logger: PinoLogger,
    cls: ClsService
  ) {
    this.prisma = prisma
    this.configService = configService
    this.isDatabaseConfigured = !!configService.get<string>('DATABASE_URL')
    this.logger = logger
    this.cls = cls
  }

  protected logInfo(message: string, meta?: any) {
    // 自动添加 requestId 到日志元数据
    const logMeta = {
      ...meta,
      requestId: this.getRequestId(),
    }
    this.logger.info(message, logMeta)
  }

  protected logWarning(message: string, meta?: any) {
    // 自动添加 requestId 到日志元数据
    const logMeta = {
      ...meta,
      requestId: this.getRequestId(),
    }
    this.logger.warn(message, logMeta)
  }

  protected logError(message: string, error?: any) {
    // 自动添加 requestId 到日志元数据
    const logMeta = {
      requestId: this.getRequestId(),
    }
    this.logger.error(error, message, logMeta)
  }

  /**
   * 获取当前请求的 ID
   */
  protected getRequestId(): string | undefined {
    return this.cls.get('requestId')
  }

  protected handleDatabaseError(error: any): never {
    this.logError('Database operation failed', error)
    throw new BusinessInternalServerErrorException('数据库操作失败')
  }
}
