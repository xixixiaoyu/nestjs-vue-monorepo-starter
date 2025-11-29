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

        // 创建 Redis 客户端配置
        const redisConfig: any = {
          host: redisHost,
          port: redisPort,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          reconnectOnError: (err: Error) => {
            const targetError = 'READONLY'
            return err.message.includes(targetError)
          },
          // 添加连接超时
          connectTimeout: 10000,
          // 添加命令超时
          commandTimeout: 5000,
        }

        // 只有在提供了密码时才添加密码配置
        if (redisPassword) {
          redisConfig.password = redisPassword
        }

        const redis = new Redis(redisConfig)

        // 添加连接事件监听
        redis.on('connect', () => {
          logger.log(`Redis connected successfully to ${redisHost}:${redisPort}`)
        })

        redis.on('ready', () => {
          logger.log('Redis is ready to accept commands')
        })

        redis.on('error', (err) => {
          logger.error(`Redis connection error: ${err.message}`, err.stack)
        })

        redis.on('close', () => {
          logger.warn('Redis connection closed')
        })

        redis.on('reconnecting', () => {
          logger.log('Redis reconnecting...')
        })

        return redis
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
