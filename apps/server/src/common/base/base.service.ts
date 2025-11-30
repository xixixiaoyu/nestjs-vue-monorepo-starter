import { Injectable, Inject, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { BusinessInternalServerErrorException } from '../exceptions/business.exception'

@Injectable()
export class BaseService {
  protected readonly prisma: PrismaService
  protected readonly configService: ConfigService
  protected readonly isDatabaseConfigured: boolean
  protected readonly logger: Logger

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService
  ) {
    this.prisma = prisma
    this.configService = configService
    this.isDatabaseConfigured = !!configService.get<string>('DATABASE_URL')
    this.logger = new Logger(this.constructor.name)
  }

  protected logInfo(message: string, meta?: any) {
    this.logger.log(message, meta)
  }

  protected logWarning(message: string, meta?: any) {
    this.logger.warn(message, meta)
  }

  protected logError(message: string, error?: any) {
    this.logger.error(message, error)
  }

  protected handleDatabaseError(error: any): never {
    this.logError('Database operation failed', error)
    throw new BusinessInternalServerErrorException('数据库操作失败')
  }
}
