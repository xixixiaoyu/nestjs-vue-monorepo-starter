import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { UsersService } from './users.service'
import { IsEmail, IsOptional, IsString } from 'class-validator'

class CreateUserDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsOptional()
  name?: string
}

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list() {
    return this.users.list()
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: CreateUserDto) {
    return this.users.create({ email: dto.email, name: dto.name })
  }
}
