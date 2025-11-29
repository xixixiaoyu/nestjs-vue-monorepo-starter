import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb?schema=public'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
    const adapter = new PrismaPg({ connectionString })

    super({ adapter })
  }

  async onModuleInit() {
    try {
      console.log('Attempting to connect to database...')
      await this.$connect()
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Failed to connect to database:', error)
      throw error
    }
  }
}
