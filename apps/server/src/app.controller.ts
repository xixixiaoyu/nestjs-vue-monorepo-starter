import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { ApiHealth } from '@types'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/health')
  getHealth(): ApiHealth {
    return this.appService.getHealth()
  }
}
