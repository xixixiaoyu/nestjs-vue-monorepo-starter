import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClsModule } from 'nestjs-cls'
import { TracingService } from './tracing.service'

@Module({
  imports: [ConfigModule, ClsModule],
  providers: [TracingService],
  exports: [TracingService],
})
export class TracingModule {}
