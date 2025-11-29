import { plainToInstance } from 'class-transformer'
import type { ValidationError } from 'class-validator'
import { IsEnum, IsNumber, IsOptional, IsString, IsArray, validateSync } from 'class-validator'

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

  @IsString()
  @IsOptional()
  @IsArray()
  CORS_ORIGINS?: string[]
}

export const validateEnvironment = (config: Record<string, unknown>) => {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors: ValidationError[] = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  })

  if (errors.length > 0) {
    const message = errors
      .map((error: ValidationError) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ')

    throw new Error(message || 'Invalid environment configuration')
  }

  return validated
}
