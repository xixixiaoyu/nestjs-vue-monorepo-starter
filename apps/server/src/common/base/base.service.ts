import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { BusinessInternalServerErrorException } from '../exceptions/business.exception'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'

@Injectable()
export class BaseService {
  protected readonly prisma: PrismaService
  protected readonly configService: ConfigService
  protected readonly isDatabaseConfigured: boolean
  protected readonly logger: PinoLogger

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
    @InjectPinoLogger(BaseService.name) logger: PinoLogger
  ) {
    this.prisma = prisma
    this.configService = configService
    this.isDatabaseConfigured = !!configService.get<string>('DATABASE_URL')
    this.logger = logger
  }

  protected logInfo(message: string, meta?: any) {
    this.logger.info(message, meta)
  }

  protected logWarning(message: string, meta?: any) {
    this.logger.warn(message, meta)
  }

  protected logError(message: string, error?: any) {
    this.logger.error(error, message)
  }

  protected handleDatabaseError(error: any): never {
    this.logError('Database operation failed', error)
    throw new BusinessInternalServerErrorException('数据库操作失败')
  }
}
