import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger'
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus'
import { ConfigService } from '@nestjs/config'
import { RedisHealthIndicator } from './redis.health-indicator'
import { PinoLogger } from 'nestjs-pino'
import { PrismaService } from '../prisma/prisma.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService
  ) {
    this.logger.setContext('HealthController')
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({ status: 200, description: '系统健康' })
  @ApiResponse({ status: 503, description: '系统不健康' })
  async check() {
    this.logger.info('执行健康检查')
    return this.health.check([
      () => this.checkDatabase(),
      () => this.redis.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.disk.checkStorage('storage', { thresholdPercent: 0.9, path: '/' }),
    ])
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: '就绪检查' })
  @ApiResponse({ status: 200, description: '服务就绪' })
  @ApiResponse({ status: 503, description: '服务未就绪' })
  async readiness() {
    this.logger.info('执行就绪检查')
    return this.health.check([() => this.checkDatabase(), () => this.redis.isHealthy('redis')])
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({ status: 200, description: '服务存活' })
  @ApiResponse({ status: 503, description: '服务未存活' })
  liveness() {
    this.logger.info('执行存活检查')
    return this.health.check([() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)])
  }

  @Get('info')
  @ApiOperation({ summary: '应用信息' })
  @ApiResponse({ status: 200, description: '应用信息' })
  getInfo() {
    const info = {
      name: this.configService.get<string>('APP_NAME') || 'Nest + Vue Template API',
      version: this.configService.get<string>('APP_VERSION') || '1.0.0',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    }

    this.logger.info('获取应用信息', info)
    return info
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return {
        database: {
          status: 'up',
        },
      } as HealthIndicatorResult
    } catch (error) {
      this.logger.error('数据库健康检查失败', error)
      throw new Error('数据库连接失败')
    }
  }
}
