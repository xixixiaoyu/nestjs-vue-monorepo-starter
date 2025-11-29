import { plainToInstance } from 'class-transformer'
import type { ValidationError } from 'class-validator'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  validateSync,
  Min,
  Max,
} from 'class-validator'

export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV?: NodeEnvironment

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  PORT?: number

  @IsString()
  @IsOptional()
  DATABASE_URL?: string

  @IsString()
  @IsOptional()
  JWT_SECRET?: string

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  CORS_ORIGINS?: string[]

  @IsString()
  @IsOptional()
  REDIS_HOST?: string

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  REDIS_PORT?: number

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string
}

export const validateEnvironment = (config: Record<string, unknown>) => {
  // 确保 PORT 是数字类型
  if (config.PORT !== undefined) {
    config.PORT = Number(config.PORT)
  }
  // 确保 REDIS_PORT 是数字类型
  if (config.REDIS_PORT !== undefined) {
    config.REDIS_PORT = Number(config.REDIS_PORT)
  }

  // 处理 CORS_ORIGINS 字符串数组
  if (config.CORS_ORIGINS !== undefined && typeof config.CORS_ORIGINS === 'string') {
    config.CORS_ORIGINS = (config.CORS_ORIGINS as string).split(',').map((origin) => origin.trim())
  }

  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  })

  if (errors.length > 0) {
    const message = errors
      .map((error: ValidationError) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ')

    // eslint-disable-next-line no-console
    console.warn('Environment validation warnings:', message || 'Invalid environment configuration')
    // 不要抛出错误，只记录警告
  }

  return validated
}
