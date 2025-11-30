import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common'
import { ClsExampleService } from './cls-example.service'
import { ClsService } from 'nestjs-cls'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'

@Controller('cls-example')
export class ClsExampleController {
  constructor(
    private readonly clsExampleService: ClsExampleService,
    private readonly cls: ClsService,
    @InjectPinoLogger(ClsExampleController.name) private readonly logger: PinoLogger
  ) {}

  @Get('request-id')
  async getRequestId() {
    // 在 Controller 中也可以直接获取 requestId
    const requestId = this.cls.get('requestId')

    this.logger.info('Controller 层获取 requestId', {
      controllerRequestId: requestId,
      endpoint: '/cls-example/request-id',
    })

    // 调用 Service 层方法，演示跨层的 requestId 传递
    const result = await this.clsExampleService.demonstrateClsAccess()

    return {
      controllerRequestId: requestId,
      serviceRequestId: result.requestId,
      message: result.message,
      timestamp: new Date().toISOString(),
    }
  }

  @Post('error-demo')
  async errorDemo() {
    const requestId = this.cls.get('requestId')

    this.logger.info('开始错误演示', {
      requestId,
      endpoint: '/cls-example/error-demo',
    })

    try {
      await this.clsExampleService.demonstrateErrorHandling()
      return { success: true, message: '不应该到达这里' }
    } catch (error) {
      // 即使在异常处理中，我们也能获取到相同的 requestId
      this.logger.error('捕获到 Service 层抛出的错误', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        endpoint: '/cls-example/error-demo',
      })

      throw new HttpException(
        {
          requestId,
          message: '演示错误处理',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('nested-calls')
  async nestedCalls() {
    const requestId = this.cls.get('requestId')

    this.logger.info('开始嵌套调用演示', {
      requestId,
      endpoint: '/cls-example/nested-calls',
    })

    // 演示多次调用 Service 方法，每次都能获取到相同的 requestId
    const result1 = await this.clsExampleService.demonstrateClsAccess()
    const result2 = await this.clsExampleService.demonstrateClsAccess()

    return {
      requestId,
      call1RequestId: result1.requestId,
      call2RequestId: result2.requestId,
      requestIdConsistent:
        requestId === result1.requestId && result1.requestId === result2.requestId,
      message: '验证多次调用中 requestId 的一致性',
    }
  }
}
