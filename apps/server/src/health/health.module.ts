import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'
import { RedisHealthIndicator } from './redis.health-indicator'
import { RedisModule } from '../redis/redis.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [TerminusModule, RedisModule, PrismaModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
  exports: [RedisHealthIndicator],
})
export class HealthModule {}
