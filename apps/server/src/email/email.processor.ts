import { Processor, OnQueueEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { SendWelcomeEmailData } from './email.service'

/**
 * 邮件队列处理器
 * 处理所有与邮件相关的异步任务
 */
@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  constructor(
    @InjectPinoLogger(EmailProcessor.name)
    private readonly logger: PinoLogger
  ) {
    super()
  }

  /**
   * 处理发送欢迎邮件的任务
   * @param job 包含邮件数据的任务
   */
  async process(job: Job<SendWelcomeEmailData>): Promise<any> {
    const { email, name, userId } = job.data
    this.logger.info(`Processing welcome email job ${job.id} for user ${userId} (${email})`)

    try {
      // 模拟发送邮件的耗时操作
      await this.simulateEmailSending(email, name)

      // 更新任务进度 (在 BullMQ 中使用 updateProgress 方法)
      await job.updateProgress(50)

      // 模拟更多处理时间
      await this.sleep(1000)

      // 更新任务进度为完成
      await job.updateProgress(100)

      // 返回处理结果
      return {
        success: true,
        message: `Welcome email sent to ${email}`,
        userId,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error(`Failed to process welcome email job ${job.id}`, error)
      throw error
    }
  }

  /**
   * 模拟发送邮件的耗时操作
   * @param email 收件人邮箱
   * @param name 收件人姓名
   */
  private async simulateEmailSending(email: string, _name: string): Promise<void> {
    // 模拟网络延迟和邮件服务处理时间
    const delay = Math.random() * 2000 + 1000 // 1-3秒的随机延迟
    await this.sleep(delay)

    // 模拟偶尔的发送失败（10%概率）
    if (Math.random() < 0.1) {
      throw new Error(`Failed to send email to ${email}: SMTP server error`)
    }

    this.logger.info(`Email successfully sent to ${email} (took ${delay.toFixed(0)}ms)`)
  }

  /**
   * 工具方法：延迟执行
   * @param ms 延迟毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 监听任务完成事件
   * @param job 完成的任务
   * @param result 任务结果
   */
  @OnQueueEvent('completed')
  onCompleted(job: Job<SendWelcomeEmailData>, result: any) {
    this.logger.info(
      `Job ${job.id} completed for user ${job.data.userId}. Result: ${JSON.stringify(result)}`
    )
  }

  /**
   * 监听任务失败事件
   * @param job 失败的任务
   * @param error 错误信息
   */
  @OnQueueEvent('failed')
  onFailed(job: Job<SendWelcomeEmailData>, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for user ${job.data.userId}. Error: ${error.message}`,
      error.stack
    )
  }

  /**
   * 监听任务停滞事件（处理时间过长）
   * @param job 停滞的任务
   */
  @OnQueueEvent('stalled')
  onStalled(job: Job<SendWelcomeEmailData>) {
    this.logger.warn(`Job ${job.id} has stalled for user ${job.data.userId}`)
  }

  /**
   * 监听任务进度事件
   * @param job 进度更新的任务
   * @param progress 进度百分比
   */
  @OnQueueEvent('progress')
  onProgress(job: Job<SendWelcomeEmailData>, progress: number) {
    this.logger.info(`Job ${job.id} progress: ${progress}% for user ${job.data.userId}`)
  }
}
