import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { EmailService } from './email.service'
import { EmailProcessor } from './email.processor'
import { EmailController } from './email.controller'

@Module({
  imports: [
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
