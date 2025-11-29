export type EnvironmentName = 'development' | 'test' | 'production'

export type HealthDto = {
  status: 'ok'
  timestamp: string
  environment: EnvironmentName
  database: 'configured' | 'fallback'
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
