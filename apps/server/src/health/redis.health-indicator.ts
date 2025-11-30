import { Injectable } from '@nestjs/common'
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
import { Redis } from 'ioredis'
import { PinoLogger } from 'nestjs-pino'

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    private readonly redis: Redis,
    private readonly logger: PinoLogger
  ) {
    super()
    this.logger.setContext('RedisHealthIndicator')
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const start = Date.now()
      await this.redis.ping()
      const responseTime = Date.now() - start

      this.logger.info(`Redis 健康检查成功，响应时间: ${responseTime}ms`)

      return this.getStatus(key, true, {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      this.logger.error('Redis 健康检查失败', error)
      return this.getStatus(key, false, {
        message: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
