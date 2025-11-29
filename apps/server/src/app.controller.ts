import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import type { UserDto } from '@shared-types'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/user/example')
  exampleUser(): UserDto {
    return {
      id: 'u_001',
      email: 'example@example.com',
      name: 'Example',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}
