import { z } from 'zod'

// 用户相关 Schema
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export const UserSchema = CreateUserSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// 认证相关 Schema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional(),
})

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
})

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  role: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
})

// 邮件相关 Schema
export const SendWelcomeEmailSchema = z.object({
  email: z.string().email('请提供有效的邮箱地址'),
  name: z.string().min(1, '姓名不能为空'),
  userId: z.string().uuid('请提供有效的用户 ID'),
})

// 健康检查 Schema
export const HealthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  environment: z.enum(['development', 'test', 'production']),
  database: z.enum(['configured', 'fallback']),
})

export const ApiHealthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
})

// API 响应 Schema
export const ApiResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    data: data.optional(),
    message: z.string().optional(),
    statusCode: z.number(),
    timestamp: z.string(),
    path: z.string(),
  })

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  message: z.string(),
  error: z.string().optional(),
})

// 分页 Schema
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const PaginatedResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    data: z.array(data),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
