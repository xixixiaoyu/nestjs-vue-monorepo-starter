import { Module } from '@nestjs/common'
import { MetricsController } from './metrics.controller'
import { MetricsService } from './metrics.service'
import { LoggerModule } from 'nestjs-pino'

@Module({
  imports: [LoggerModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
