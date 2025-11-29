import { Injectable, Inject } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject('REDIS') private redis: Redis) {}

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
    // Redis 会自动清理过期的键，这里可以添加额外的清理逻辑
    const keys = await this.redis.keys('blacklist:*')
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
