import { Injectable, Inject } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS } from '../redis/redis.module'

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS) private redis: Redis) {}

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await this.redis.setex(`blacklist:${token}`, expiresIn, '1')
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`)
    return result === '1'
  }

  async removeFromBlacklist(token: string): Promise<void> {
    await this.redis.del(`blacklist:${token}`)
  }

  async clearExpiredTokens(): Promise<void> {
    // Redis 会自动清理过期的键，这个方法用于手动清理所有黑名单令牌
    // 警告：这会清除所有黑名单令牌，包括未过期的
    // 通常不需要调用此方法，除非需要强制清除所有黑名单令牌
    const keys = await this.redis.keys('blacklist:*')
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async getBlacklistedTokenCount(): Promise<number> {
    const keys = await this.redis.keys('blacklist:*')
    return keys.length
  }
}
