import { Body, Controller, Get, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

class CreateUserDto extends createZodDto(CreateUserSchema) {}

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list() {
    return this.users.list()
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.users.create({ email: dto.email, name: dto.name })
  }
}
