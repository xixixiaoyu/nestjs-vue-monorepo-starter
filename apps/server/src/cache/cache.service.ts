import { Injectable, Inject, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS } from '../redis/redis.module'

// 内存缓存项接口
interface MemoryCacheItem<T> {
  value: T
  expiry: number
  createdAt: number
}

// 缓存配置接口
interface CacheConfig {
  defaultTtl: number
  memoryCacheSize: number
  memoryCacheEnabled: boolean
  redisCacheEnabled: boolean
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly memoryCache = new Map<string, MemoryCacheItem<any>>()
  private readonly config: CacheConfig

  constructor(@Inject(REDIS) private redis: Redis) {
    this.config = {
      defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
      memoryCacheSize: parseInt(process.env.CACHE_MEMORY_SIZE || '1000', 10),
      memoryCacheEnabled: process.env.CACHE_MEMORY_ENABLED !== 'false',
      redisCacheEnabled: process.env.CACHE_REDIS_ENABLED !== 'false',
    }
  }

  // 获取缓存（多级缓存）
  async get<T>(key: string): Promise<T | null> {
    try {
      // 1. 首先检查内存缓存
      if (this.config.memoryCacheEnabled) {
        const memoryItem = this.memoryCache.get(key)
        if (memoryItem && memoryItem.expiry > Date.now()) {
          this.logger.debug(`Memory cache hit for key: ${key}`)
          return memoryItem.value
        }
        // 清理过期的内存缓存
        if (memoryItem && memoryItem.expiry <= Date.now()) {
          this.memoryCache.delete(key)
        }
      }

      // 2. 检查 Redis 缓存
      if (this.config.redisCacheEnabled) {
        const value = await this.redis.get(key)
        if (value) {
          const parsedValue = JSON.parse(value)
          this.logger.debug(`Redis cache hit for key: ${key}`)

          // 将 Redis 缓存同步到内存缓存
          if (this.config.memoryCacheEnabled) {
            this.setMemoryCache(key, parsedValue, this.config.defaultTtl)
          }

          return parsedValue
        }
      }

      this.logger.debug(`Cache miss for key: ${key}`)
      return null
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  // 设置缓存（多级缓存）
  async set(key: string, value: any, ttl: number = this.config.defaultTtl): Promise<void> {
    try {
      // 1. 设置内存缓存
      if (this.config.memoryCacheEnabled) {
        this.setMemoryCache(key, value, ttl)
      }

      // 2. 设置 Redis 缓存
      if (this.config.redisCacheEnabled) {
        await this.redis.setex(key, ttl, JSON.stringify(value))
      }

      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`)
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error)
    }
  }

  // 设置内存缓存（私有方法）
  private setMemoryCache<T>(key: string, value: T, ttl: number): void {
    // 检查内存缓存大小限制
    if (this.memoryCache.size >= this.config.memoryCacheSize) {
      // 删除最旧的缓存项（LRU 策略）
      const oldestKey = this.memoryCache.keys().next().value
      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      }
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
      createdAt: Date.now(),
    })
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

  // 获取缓存统计信息
  async getStats(): Promise<{
    memoryCache: { size: number; maxSize: number; enabled: boolean }
    redisCache: { enabled: boolean }
  }> {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.config.memoryCacheSize,
        enabled: this.config.memoryCacheEnabled,
      },
      redisCache: {
        enabled: this.config.redisCacheEnabled,
      },
    }
  }

  // 清空所有缓存
  async clear(): Promise<void> {
    try {
      // 清空内存缓存
      if (this.config.memoryCacheEnabled) {
        this.memoryCache.clear()
      }

      // 清空 Redis 缓存
      if (this.config.redisCacheEnabled) {
        await this.redis.flushdb()
      }

      this.logger.log('All caches cleared')
    } catch (error) {
      this.logger.error('Error clearing caches:', error)
    }
  }

  // 预热缓存
  async warmup<T>(keys: string[], dataProvider: (key: string) => Promise<T>): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const exists = await this.exists(key)
        if (!exists) {
          const data = await dataProvider(key)
          await this.set(key, data)
          this.logger.debug(`Warmed up cache for key: ${key}`)
        }
      } catch (error) {
        this.logger.error(`Error warming up cache for key ${key}:`, error)
      }
    })

    await Promise.all(promises)
    this.logger.log(`Cache warmup completed for ${keys.length} keys`)
  }

  // 获取或设置（原子操作）
  async getOrSet<T>(
    key: string,
    dataProvider: () => Promise<T>,
    ttl: number = this.config.defaultTtl
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await dataProvider()
    await this.set(key, data, ttl)
    return data
  }

  // 批量获取
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.config.redisCacheEnabled) {
        const values = await this.redis.mget(...keys)
        return values.map((value) => (value ? JSON.parse(value) : null))
      }

      // 如果只使用内存缓存
      return keys.map((key) => {
        const item = this.memoryCache.get(key)
        return item && item.expiry > Date.now() ? item.value : null
      })
    } catch (error) {
      this.logger.error(`Cache mget error for keys ${keys}:`, error)
      return keys.map(() => null)
    }
  }

  // 批量设置
  async mset(
    keyValuePairs: Record<string, any>,
    ttl: number = this.config.defaultTtl
  ): Promise<void> {
    try {
      const pipeline = this.redis.pipeline()

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value))

        // 同时设置内存缓存
        if (this.config.memoryCacheEnabled) {
          this.setMemoryCache(key, value, ttl)
        }
      })

      await pipeline.exec()
      this.logger.debug(`Batch cache set for ${Object.keys(keyValuePairs).length} keys`)
    } catch (error) {
      this.logger.error(`Cache mset error:`, error)
    }
  }

  // 缓存装饰器工厂（增强版）
  static cache(
    ttl: number = 3600,
    keyPrefix: string = '',
    condition?: (...args: any[]) => boolean
  ) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        // 检查条件
        if (condition && !condition(...args)) {
          return await method.apply(this, args)
        }

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

  // 缓存失效装饰器
  static invalidate(keyPattern: string) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        // 执行原方法
        const result = await method.apply(this, args)

        // 获取缓存服务实例
        const cacheService = (this as any).cacheService
        if (cacheService) {
          await cacheService.delPattern(keyPattern)
        }

        return result
      }
    }
  }
}
