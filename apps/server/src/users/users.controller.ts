import { Body, Controller, Get, Post, Inject } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserRequestDto } from '@project/shared-types'

@Controller('api/users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get()
  async list() {
    return this.users.list()
  }

  @Post()
  async create(@Body() dto: CreateUserRequestDto) {
    return this.users.create({ email: dto.email, name: dto.name })
  }
}
