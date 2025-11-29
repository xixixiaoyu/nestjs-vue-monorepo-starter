import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import type { CreateUserInput, UserDto } from '@shared-types'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  private fallbackUsers: UserDto[] = []

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  private get isDatabaseConfigured() {
    return Boolean(this.config.get<string>('DATABASE_URL'))
  }

  async list() {
    if (!this.isDatabaseConfigured) {
      if (this.fallbackUsers.length === 0) {
        throw new ServiceUnavailableException('database not configured')
      }

      return this.fallbackUsers
    }

    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async create(data: CreateUserInput) {
    if (!this.isDatabaseConfigured) {
      const now = new Date().toISOString()
      const user: UserDto = {
        id: `local_${randomUUID()}`,
        email: data.email,
        name: data.name ?? null,
        createdAt: now,
        updatedAt: now,
      }

      this.fallbackUsers = [user, ...this.fallbackUsers]

      return user
    }

    return this.prisma.user.create({ data })
  }
}
