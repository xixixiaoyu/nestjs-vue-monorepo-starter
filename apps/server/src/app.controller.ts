import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { HealthDto, UserDto } from '@shared-types'

@Controller('api')
export class AppController {
  constructor(private appService: AppService) {}

  @Get('health')
  getHealth(): HealthDto {
    console.log('AppController.getHealth called')
    console.log('appService:', this.appService)

    // 直接返回一个简单的健康检查，不依赖 appService
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'development' as any,
      database: 'configured',
    }
  }

  @Get('user/example')
  exampleUser(): UserDto {
    if (!this.appService) {
      console.log('appService is undefined in exampleUser')
      // 返回一个简单的示例用户
      const now = new Date().toISOString()
      return {
        id: 'u_001',
        email: 'example@example.com',
        name: 'Example',
        createdAt: now,
        updatedAt: now,
      }
    }
    return this.appService.getExampleUser()
  }
}
