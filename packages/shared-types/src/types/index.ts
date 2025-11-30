// 从 Zod Schema 导出的纯 TypeScript 类型
import type { z } from 'zod'
import type {
  CreateUserSchema,
  UserSchema,
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
  JwtPayloadSchema,
  SendWelcomeEmailSchema,
  HealthSchema,
  ApiHealthSchema,
  PaginationParamsSchema,
} from '../schemas'

// 用户相关类型
export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UserDto = z.infer<typeof UserSchema>

// 认证相关类型
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type JwtPayload = z.infer<typeof JwtPayloadSchema>

// 邮件相关类型
export type SendWelcomeEmailDto = z.infer<typeof SendWelcomeEmailSchema>

// 健康检查类型
export type HealthDto = z.infer<typeof HealthSchema>
export type ApiHealth = z.infer<typeof ApiHealthSchema>

// 分页类型
export type PaginationParams = z.infer<typeof PaginationParamsSchema>
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 通用 API 类型
export type ApiResponse<T = any> = {
  data?: T
  message?: string
  statusCode: number
  timestamp: string
  path: string
}

export type ApiError = {
  statusCode: number
  timestamp: string
  path: string
  message: string
  error?: string
}

// 环境类型
export type EnvironmentName = 'development' | 'test' | 'production'

// 角色权限类型
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export type Permission = {
  action: string
  resource: string
}
