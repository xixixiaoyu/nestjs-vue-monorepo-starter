import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { EmailService } from './email.service'
import { EmailProcessor } from './email.processor'
import { EmailController } from './email.controller'

@Module({
  imports: [
    // BullMQ 全局配置
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    // 注册 email-queue 队列
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
