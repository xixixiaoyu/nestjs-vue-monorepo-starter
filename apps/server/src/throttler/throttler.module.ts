import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { Redis } from 'ioredis'
import { REDIS } from '../redis/redis.module'
import { ThrottlerExampleController } from './throttler-example.controller'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [],
      inject: [ConfigService, REDIS],
      useFactory: (configService: ConfigService, redis: Redis) => {
        const ttl = configService.get<number>('THROTTLE_TTL', 60)
        const limit = configService.get<number>('THROTTLE_LIMIT', 100)

        return {
          throttlers: [
            {
              ttl,
              limit,
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
        }
      },
    }),
  ],
  controllers: [ThrottlerExampleController],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}
