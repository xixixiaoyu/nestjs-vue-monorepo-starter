import { Controller, Post, Body, Get, HttpException, HttpStatus, Inject } from '@nestjs/common'
import { EmailService } from './email.service'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ZodValidationPipe } from 'nestjs-zod'

// 定义 Zod Schema
const SendWelcomeEmailSchema = z.object({
  email: z.string().email('请提供有效的邮箱地址'),
  name: z.string().min(1, '姓名不能为空'),
  userId: z.string().uuid('请提供有效的用户 ID'),
})

// 生成 DTO 类
class SendWelcomeEmailDto extends createZodDto(SendWelcomeEmailSchema) {}

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(@Inject(EmailService) private readonly emailService: EmailService) {}

  @Post('send-welcome')
  @ApiOperation({ summary: '发送欢迎邮件' })
  @ApiResponse({ status: 200, description: '邮件任务已添加到队列' })
  @ApiBody({
    type: SendWelcomeEmailDto,
    description: '发送欢迎邮件的请求参数',
    examples: {
      valid: {
        summary: '有效的请求示例',
        value: {
          email: 'user@example.com',
          name: 'John Doe',
          userId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  async sendWelcomeEmail(
    @Body(new ZodValidationPipe(SendWelcomeEmailSchema)) sendWelcomeEmailDto: SendWelcomeEmailDto
  ) {
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
