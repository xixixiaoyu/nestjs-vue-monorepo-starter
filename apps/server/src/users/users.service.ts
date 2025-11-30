import { Injectable, ServiceUnavailableException, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import type { CreateUserInput, UserDto } from '@shared-types'
import { PrismaService } from '../prisma/prisma.service'
import { BaseService } from '../common/base/base.service'
import { NotFoundException } from '../common/exceptions/business.exception'
import { ClsService } from 'nestjs-cls'
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino'

@Injectable()
export class UsersService extends BaseService {
  private fallbackUsers: UserDto[] = []

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
    @InjectPinoLogger(UsersService.name) logger: PinoLogger,
    cls: ClsService
  ) {
    super(prisma, configService, logger, cls)
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
        name: user.name || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))

      this.logInfo('Retrieved users from database', { count: users.length })
      return userDtos
    } catch (error) {
      this.handleDatabaseError(error)
      // 由于 handleDatabaseError 会抛出异常，这里永远不会执行
      // 但为了类型安全，我们添加一个返回语句
      return []
    }
  }

  async create(data: CreateUserInput): Promise<UserDto> {
    try {
      if (!this.isDatabaseConfigured) {
        const now = new Date().toISOString()
        const user: UserDto = {
          id: `local_${randomUUID()}`,
          email: data.email,
          name: data.name ?? undefined,
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
        name: user.name || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
      this.logInfo('Created user in database', { email: user.email })
      return userDto
    } catch (error) {
      this.handleDatabaseError(error)
      // 由于 handleDatabaseError 会抛出异常，这里永远不会执行
      // 但为了类型安全，我们添加一个返回语句
      throw error
    }
  }

  async findById(id: string): Promise<UserDto | null> {
    try {
      if (!this.isDatabaseConfigured) {
        const user = this.fallbackUsers.find((u) => u.id === id)
        return user || null
      }

      const user = await this.prisma.user.findUnique({ where: { id } })
      if (!user) {
        throw new NotFoundException('用户')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      this.handleDatabaseError(error)
      // 由于 handleDatabaseError 会抛出异常，这里永远不会执行
      // 但为了类型安全，我们添加一个返回语句
      return null
    }
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    try {
      if (!this.isDatabaseConfigured) {
        const user = this.fallbackUsers.find((u) => u.email === email)
        return user || null
      }

      const user = await this.prisma.user.findUnique({ where: { email } })
      if (!user) {
        throw new NotFoundException('用户')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    } catch (error) {
      this.handleDatabaseError(error)
      // 由于 handleDatabaseError 会抛出异常，这里永远不会执行
      // 但为了类型安全，我们添加一个返回语句
      return null
    }
  }
}
