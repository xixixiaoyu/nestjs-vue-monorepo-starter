export type EnvironmentName = 'development' | 'test' | 'production'

export type HealthDto = {
  status: 'ok'
  timestamp: string
  environment: EnvironmentName
  database: 'configured' | 'fallback'
}

export type ApiHealth = {
  status: 'ok'
  timestamp: string
}

export type CreateUserInput = {
  email: string
  name?: string | null
}

export type UserDto = CreateUserInput & {
  id: string
  createdAt: string
  updatedAt: string
}

// API 请求和响应类型
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

// 认证相关类型
export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  name?: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: UserDto
}

export type JwtPayload = {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

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

// 分页类型
export type PaginationParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
