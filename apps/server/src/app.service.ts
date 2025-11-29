import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import type { EnvironmentName, HealthDto, UserDto } from '@shared-types'
import { NodeEnvironment } from './config/environment'

@Injectable()
export class AppService {
  constructor(
    private readonly config: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: any
  ) {}

  getHealth(): HealthDto {
    this.logger.log('Getting health check status', 'AppService')

    const environment = (this.config.get<NodeEnvironment>('NODE_ENV') ??
      NodeEnvironment.Development) as EnvironmentName

    const database = this.config.get<string>('DATABASE_URL') ? 'configured' : 'fallback'

    this.logger.debug(`Database status: ${database}`, 'AppService')
    this.logger.info(`Health check requested in ${environment} environment`, 'AppService')

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment,
      database,
    }
  }

  getExampleUser(): UserDto {
    this.logger.log('Fetching example user data', 'AppService')

    const now = new Date().toISOString()

    this.logger.warn('This is a sample warning message for testing', 'AppService')

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

      this.logger.debug('Example user data retrieved successfully', 'AppService')
      return userData
    } catch (error) {
      this.logger.error(
        'Failed to fetch example user',
        error instanceof Error ? error.stack : String(error),
        'AppService'
      )
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
