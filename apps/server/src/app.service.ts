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

    return {
      id: 'u_001',
      email: 'example@example.com',
      name: 'Example',
      createdAt: now,
      updatedAt: now,
    }
  }
}
