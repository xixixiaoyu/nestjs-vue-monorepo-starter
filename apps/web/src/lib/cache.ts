// 简单的内存缓存实现
interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  // 获取所有缓存键（用于失效函数）
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 创建缓存实例
export const apiCache = new MemoryCache()

// 缓存装饰器函数
export const withCache = <T extends any[]>(
  key: string,
  ttl: number = 5 * 60 * 1000, // 5分钟
  fn: (...args: any[]) => Promise<T>
) => {
  return async (...args: any[]): Promise<T> => {
    const cacheKey = JSON.stringify(args)
    const cached = apiCache.get<T>(cacheKey)

    if (cached !== null) {
      // eslint-disable-next-line no-console
      console.log(`Cache hit for ${key}`)
      return cached
    }

    // eslint-disable-next-line no-console
    console.log(`Cache miss for ${key}`)
    const result = await fn(...args)
    apiCache.set(cacheKey, result, ttl)
    return result
  }
}

// 缓存失效函数
export const invalidateCache = (pattern: string | RegExp): void => {
  for (const key of apiCache.getKeys()) {
    if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
      apiCache.delete(key)
    }
  }
}
