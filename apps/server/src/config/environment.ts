import { z } from 'zod'

export enum NodeEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const environmentVariablesSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnvironment).optional(),
  PORT: z.coerce.number().min(1).max(65535).optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  CORS_ORIGINS: z.array(z.string()).optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().min(1).max(65535).optional(),
  REDIS_PASSWORD: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().min(1).optional(),
  THROTTLE_LIMIT: z.coerce.number().min(1).optional(),
  APP_NAME: z.string().optional(),
  APP_VERSION: z.string().optional(),
  ENABLE_SWAGGER: z.coerce.boolean().optional(),
  LOG_LEVEL: z.string().optional(),
})

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>

export const validateEnvironment = (config: Record<string, unknown>) => {
  // 处理 CORS_ORIGINS 字符串数组
  if (config.CORS_ORIGINS !== undefined && typeof config.CORS_ORIGINS === 'string') {
    config.CORS_ORIGINS = (config.CORS_ORIGINS as string).split(',').map((origin) => origin.trim())
  } else if (config.CORS_ORIGINS === undefined) {
    // 如果未定义，设置默认值
    config.CORS_ORIGINS = []
  }

  // 设置默认值
  config.APP_NAME = config.APP_NAME || 'Nest Vue Template'
  config.APP_VERSION = config.APP_VERSION || '1.0.0'
  config.JWT_EXPIRES_IN = config.JWT_EXPIRES_IN || '1h'
  config.LOG_LEVEL = config.LOG_LEVEL || 'info'
  config.THROTTLE_TTL = config.THROTTLE_TTL || 60
  config.THROTTLE_LIMIT = config.THROTTLE_LIMIT || 100

  const result = environmentVariablesSchema.safeParse(config)

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((error: any) => {
        return `${error.path.join('.')}: ${error.message}`
      })
      .join('; ')

    // eslint-disable-next-line no-console
    console.warn(
      'Environment validation warnings:',
      errorMessages || 'Invalid environment configuration'
    )
    // 不要抛出错误，只记录警告
  }

  return result.success ? result.data : (config as EnvironmentVariables)
}
