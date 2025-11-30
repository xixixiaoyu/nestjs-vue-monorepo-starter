import { Injectable, Inject } from '@nestjs/common'
import { BaseService } from '../common/base/base.service'
import { ClsService } from 'nestjs-cls'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ClsExampleService extends BaseService {
  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
    @InjectPinoLogger(ClsExampleService.name) logger: PinoLogger,
    cls: ClsService
  ) {
    super(prisma, configService, logger, cls)
  }

  /**
   * 演示在 Service 层直接获取 requestId
   */
  async demonstrateClsAccess(): Promise<{ requestId: string; message: string }> {
    // 直接从 CLS 中获取 requestId，无需从 Controller 层层传参
    const requestId = this.cls.get('requestId')

    // 使用 BaseService 的日志方法，会自动包含 requestId
    this.logInfo('这是一个来自 Service 层的日志', {
      service: 'ClsExampleService',
      action: 'demonstrateClsAccess',
    })

    // 模拟一些业务逻辑
    await this.simulateBusinessLogic()

    return {
      requestId: requestId || '未找到 requestId',
      message: '成功从 CLS 中获取 requestId',
    }
  }

  /**
   * 模拟业务逻辑，展示在不同方法中都能访问到相同的 requestId
   */
  private async simulateBusinessLogic(): Promise<void> {
    const requestId = this.getRequestId()

    this.logInfo('开始执行业务逻辑', {
      step: 'start',
      requestId,
    })

    // 模拟异步操作
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.logInfo('业务逻辑执行完成', {
      step: 'complete',
      requestId,
    })
  }

  /**
   * 演示在错误处理中也能获取到 requestId
   */
  async demonstrateErrorHandling(): Promise<void> {
    const requestId = this.getRequestId()

    try {
      this.logInfo('即将抛出一个错误', { requestId })
      throw new Error('这是一个演示错误')
    } catch (error) {
      this.logError('捕获到错误', error)
      // 重新抛出错误或者处理错误
      throw error
    }
  }
}
