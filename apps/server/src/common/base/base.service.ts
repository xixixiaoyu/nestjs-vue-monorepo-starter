import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'

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
    throw new Error('数据库操作失败')
  }

  protected handleValidationError(message: string): never {
    this.logError('Validation error', message)
    throw new Error(`验证失败: ${message}`)
  }

  protected logError(message: string, error: any): void {
    this.logger.error(message, error)
  }

  protected logInfo(message: string, data?: any): void {
    this.logger.log(message, data)
  }

  protected logWarning(message: string, data?: any): void {
    this.logger.warn(message, data)
  }
}
