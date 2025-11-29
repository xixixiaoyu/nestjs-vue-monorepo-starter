import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { HealthDto, UserDto } from '@shared-types'

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthDto {
    return this.appService.getHealth()
  }

  @Get('user/example')
  exampleUser(): UserDto {
    return this.appService.getExampleUser()
  }
}
