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

    // 优化连接池配置
    const adapter = new PrismaPg({
      connectionString,
      // 连接池配置
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      // 连接超时配置
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
      // 空闲超时配置
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      // 最大生存时间
      maxLifetimeMillis: parseInt(process.env.DB_MAX_LIFETIME || '1800000', 10), // 30分钟
      // 健康检查配置
      healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '60000', 10), // 1分钟
    })

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
    try {
      this.logger.log('Connecting to database...')
      await this.$connect()
      this.logger.log('Database connected successfully')
    } catch (error: any) {
      this.logger.error('Database connection failed:', error?.message || error)
      throw error
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
