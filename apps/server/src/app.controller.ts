import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { HealthDto, UserDto } from '@shared-types'

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthDto {
    console.log('AppController.getHealth called')
    console.log('appService:', this.appService)
    if (!this.appService) {
      console.log('appService is undefined')
      return {
        status: 'ok' as any,
        timestamp: new Date().toISOString(),
        environment: 'development' as any,
        database: 'error' as any,
      }
    }
    return this.appService.getHealth()
  }

  @Get('user/example')
  exampleUser(): UserDto {
    return this.appService.getExampleUser()
  }
}
