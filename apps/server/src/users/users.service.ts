import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException('database not configured')
    }
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async create(data: { email: string; name?: string | null }) {
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException('database not configured')
    }
    return this.prisma.user.create({ data })
  }
}
