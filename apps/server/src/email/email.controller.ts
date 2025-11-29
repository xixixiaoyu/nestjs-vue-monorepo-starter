import { Controller, Post, Body, Get, HttpException, HttpStatus, Inject } from '@nestjs/common'
import { EmailService } from './email.service'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

// 定义请求 DTO
export class SendWelcomeEmailDto {
  email: string
  name: string
  userId: string
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(@Inject(EmailService) private readonly emailService: EmailService) {}

  @Post('send-welcome')
  @ApiOperation({ summary: '发送欢迎邮件' })
  @ApiResponse({ status: 200, description: '邮件任务已添加到队列' })
  async sendWelcomeEmail(@Body() sendWelcomeEmailDto: SendWelcomeEmailDto) {
    try {
      const job = await this.emailService.addWelcomeEmailJob(
        sendWelcomeEmailDto.email,
        sendWelcomeEmailDto.name,
        sendWelcomeEmailDto.userId
      )

      return {
        success: true,
        message: 'Welcome email job added to queue',
        jobId: job.id,
        userId: sendWelcomeEmailDto.userId,
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to add welcome email job',
          details: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('queue-status')
  @ApiOperation({ summary: '获取邮件队列状态' })
  @ApiResponse({ status: 200, description: '队列状态信息' })
  async getQueueStatus() {
    try {
      const status = await this.emailService.getQueueStatus()
      return {
        success: true,
        queue: 'email-queue',
        ...status,
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get queue status',
          details: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
