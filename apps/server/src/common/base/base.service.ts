import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class BaseService {
  protected readonly prisma: PrismaService
  protected readonly configService: ConfigService
  protected readonly isDatabaseConfigured: boolean

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService
  ) {
    this.prisma = prisma
    this.configService = configService
    this.isDatabaseConfigured = !!configService.get<string>('DATABASE_URL')
  }

  protected logInfo(message: string, meta?: any) {
    console.log(`[BaseService] ${message}`, meta)
  }

  protected logWarning(message: string, meta?: any) {
    console.warn(`[BaseService] ${message}`, meta)
  }

  protected logError(message: string, error?: any) {
    console.error(`[BaseService] ${message}`, error)
  }

  protected handleDatabaseError(error: any): never {
    this.logError('Database operation failed', error)
    throw new Error('数据库操作失败')
  }
}
