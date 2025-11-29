import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import type { CreateUserInput, UserDto } from '@shared-types'
import { PrismaService } from '../prisma/prisma.service'
import { BaseService } from '../common/base/base.service'

@Injectable()
export class UsersService extends BaseService {
  private fallbackUsers: UserDto[] = []

  constructor(prisma: PrismaService, configService: ConfigService) {
    super(prisma, configService)
  }

  async list(): Promise<UserDto[]> {
    try {
      if (!this.isDatabaseConfigured) {
        if (this.fallbackUsers.length === 0) {
          this.logWarning('Database not configured and no fallback users available')
          throw new ServiceUnavailableException('database not configured')
        }

        this.logInfo('Returning fallback users', { count: this.fallbackUsers.length })
        return this.fallbackUsers
      }

      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })

      const userDtos: UserDto[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))

      this.logInfo('Retrieved users from database', { count: users.length })
      return userDtos
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async create(data: CreateUserInput): Promise<UserDto> {
    try {
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
        this.logInfo('Created fallback user', { email: user.email })
        return user
      }

      const user = await this.prisma.user.create({ data })
      const userDto: UserDto = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
      this.logInfo('Created user in database', { email: user.email })
      return userDto
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findById(id: string): Promise<UserDto | null> {
    try {
      if (!this.isDatabaseConfigured) {
        const user = this.fallbackUsers.find((u) => u.id === id)
        return user || null
      }

      const user = await this.prisma.user.findUnique({ where: { id } })
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    try {
      if (!this.isDatabaseConfigured) {
        const user = this.fallbackUsers.find((u) => u.email === email)
        return user || null
      }

      const user = await this.prisma.user.findUnique({ where: { email } })
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }
}
