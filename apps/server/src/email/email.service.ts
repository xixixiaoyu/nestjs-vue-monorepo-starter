import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bullmq'

// 定义邮件任务的数据类型
export interface SendWelcomeEmailData {
  email: string
  name: string
  userId: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(@InjectQueue('email-queue') private emailQueue: Queue<SendWelcomeEmailData>) {}

  /**
   * 添加发送欢迎邮件的任务到队列
   * @param email 收件人邮箱
   * @param name 收件人姓名
   * @param userId 用户ID
   * @returns 返回创建的任务
   */
  async addWelcomeEmailJob(email: string, name: string, userId: string) {
    try {
      const job = await this.emailQueue.add(
        'send-welcome-email',
        {
          email,
          name,
          userId,
        },
        {
          // 任务选项
          removeOnComplete: 10, // 保留最近10个完成的任务
          removeOnFail: 50, // 保留最近50个失败的任务
          attempts: 3, // 失败重试次数
          backoff: {
            type: 'exponential', // 指数退避策略
            delay: 2000, // 初始延迟2秒
          },
        }
      )

      this.logger.log(`Welcome email job added: ${job.id} for user ${userId}`)
      return job
    } catch (error) {
      this.logger.error('Failed to add welcome email job', error)
      throw error
    }
  }

  /**
   * 获取队列状态信息
   * @returns 返回队列的统计信息
   */
  async getQueueStatus() {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
      ])

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      }
    } catch (error) {
      this.logger.error('Failed to get queue status', error)
      throw error
    }
  }
}
