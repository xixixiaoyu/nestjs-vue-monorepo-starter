import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb?schema=public'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  private readonly isDevelopment: boolean

  constructor() {
    const connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
    const nodeEnv = process.env.NODE_ENV ?? 'development'

    // 判断是否为开发环境
    const isDevelopment = nodeEnv === 'development'

    // 隐藏密码信息
    const sanitizedConnectionString = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')

    const adapter = new PrismaPg({ connectionString })

    // 根据环境配置日志级别
    const logLevels = isDevelopment
      ? [
          { level: 'query' as const, emit: 'event' as const },
          { level: 'error' as const, emit: 'event' as const },
          { level: 'info' as const, emit: 'event' as const },
          { level: 'warn' as const, emit: 'event' as const },
        ]
      : [
          { level: 'error' as const, emit: 'event' as const },
          { level: 'warn' as const, emit: 'event' as const },
        ]

    super({
      adapter,
      log: logLevels,
      // 错误格式化选项
      errorFormat: 'pretty',
    })

    // 设置实例属性
    this.isDevelopment = isDevelopment

    // 设置日志事件监听器
    if (this.isDevelopment) {
      // 使用类型断言来绕过 TypeScript 的类型检查
      const prismaClient = this as any
      prismaClient.$on('query', (e: any) => {
        // 在开发环境中记录查询详情，但限制参数长度
        const params = e.params ? JSON.stringify(e.params).substring(0, 200) : 'none'
        this.logger.debug(`Query: ${e.query}`)
        this.logger.debug(
          `Params: ${params}${e.params && JSON.stringify(e.params).length > 200 ? '...' : ''}`
        )
        this.logger.debug(`Duration: ${e.duration}ms`)
      })
    }

    const prismaClient = this as any
    prismaClient.$on('error', (e: any) => {
      this.logger.error(`Prisma error: ${e.message}`, {
        target: e.target,
        code: e.code,
        version: e.version,
        engineVersion: e.engineVersion,
      })
    })

    prismaClient.$on('info', (e: any) => {
      this.logger.log(`Prisma info: ${e.message}`)
    })

    prismaClient.$on('warn', (e: any) => {
      this.logger.warn(`Prisma warning: ${e.message}`)
    })

    this.logger.log(`Initializing Prisma with connection: ${sanitizedConnectionString}`)
  }

  async onModuleInit() {
    const maxRetries = 3
    const retryDelay = 2000 // 2秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to database... (attempt ${attempt}/${maxRetries})`)
        await this.$connect()
        this.logger.log('Database connected successfully')

        // 测试连接
        await this.$queryRaw`SELECT 1`
        this.logger.log('Database connection test passed')
        return // 连接成功，退出重试循环
      } catch (error: any) {
        this.logger.error(`Database connection attempt ${attempt} failed:`, error?.message || error)

        if (attempt === maxRetries) {
          this.logger.error('Failed to connect to database after maximum retries')
          throw new Error(`数据库连接失败，已重试 ${maxRetries} 次`)
        }

        // 等待后重试
        this.logger.log(`Waiting ${retryDelay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database...')
      await this.$disconnect()
      this.logger.log('Database disconnected successfully')
    } catch (error: any) {
      this.logger.error('Error disconnecting from database:', error?.message || error)
    }
  }

  /**
   * 健康检查方法
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.$queryRaw`SELECT 1`
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      this.logger.error('Database health check failed:', error?.message || error)
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      }
    }
  }
}
