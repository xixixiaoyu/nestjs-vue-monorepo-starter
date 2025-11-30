import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { EnvironmentName, HealthDto, UserDto } from '@shared-types'
import { NodeEnvironment } from './config/environment'

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService) {}

  getHealth(): HealthDto {
    const environment = (this.config.get<NodeEnvironment>('NODE_ENV') ??
      NodeEnvironment.Development) as EnvironmentName

    const database = this.config.get<string>('DATABASE_URL') ? 'configured' : 'fallback'

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment,
      database,
    }
  }

  getExampleUser(): UserDto {
    const now = new Date().toISOString()

    try {
      // 模拟一个可能的错误场景
      const shouldError = Math.random() > 0.8
      if (shouldError) {
        throw new Error('Random error for testing purposes')
      }

      const userData = {
        id: 'u_001',
        email: 'example@example.com',
        name: 'Example',
        createdAt: now,
        updatedAt: now,
      }

      return userData
    } catch {
      // 仍然返回默认数据，避免影响 API 功能
      return {
        id: 'u_001',
        email: 'example@example.com',
        name: 'Example',
        createdAt: now,
        updatedAt: now,
      }
    }
  }
}
