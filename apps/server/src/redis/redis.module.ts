import { Module, Global, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS = 'REDIS'

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule')
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost')
        const redisPort = configService.get<number>('REDIS_PORT', 6379)
        const redisPassword = configService.get<string>('REDIS_PASSWORD')

        // 如果没有配置 Redis，返回 null 以避免连接错误
        if (!redisHost) {
          logger.log('Redis not configured, skipping Redis connection')
          return null
        }

        return new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          // 添加连接错误处理
          lazyConnect: true,
          reconnectOnError: true,
        } as any)
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
