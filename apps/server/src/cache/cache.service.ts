import { Injectable, Inject, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS } from '../redis/redis.module'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(@Inject(REDIS) private redis: Redis) {}

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  // 设置缓存
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error)
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error)
    }
  }

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }

  // 批量删除缓存（支持模式匹配）
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      this.logger.error(`Cache delPattern error for pattern ${pattern}:`, error)
    }
  }

  // 增加数值
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key)
    } catch (error) {
      this.logger.error(`Cache incr error for key ${key}:`, error)
      return 0
    }
  }

  // 设置过期时间
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl)
    } catch (error) {
      this.logger.error(`Cache expire error for key ${key}:`, error)
    }
  }

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key)
    } catch (error) {
      this.logger.error(`Cache ttl error for key ${key}:`, error)
      return -1
    }
  }

  // 缓存装饰器工厂
  static cache(ttl: number = 3600, keyPrefix: string = '') {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${keyPrefix}:${propertyName}:${JSON.stringify(args)}`

        // 获取缓存服务实例
        const cacheService = (this as any).cacheService
        if (!cacheService) {
          // 如果没有缓存服务，直接执行原方法
          return await method.apply(this, args)
        }

        // 尝试从缓存获取
        const cached = await cacheService.get(cacheKey)
        if (cached !== null) {
          return cached
        }

        // 执行原方法
        const result = await method.apply(this, args)

        // 缓存结果
        await cacheService.set(cacheKey, result, ttl)

        return result
      }
    }
  }
}
