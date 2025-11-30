/**
 * 前端使用纯 TypeScript 类型的示例
 *
 * 这个文件展示了前端如何安全地使用从 Zod Schema 导出的纯 TypeScript 类型，
 * 而不需要导入 nestjs-zod 或 createZodDto。
 */

import type {
  // 用户相关类型
  CreateUserInput,
  UserDto,

  // 认证相关类型
  LoginInput,
  RegisterInput,
  AuthResponse,
  JwtPayload,

  // API 响应类型
  ApiResponse,

  // 分页类型
  PaginationParams,
  PaginatedResponse,
} from '../src/types'

// ===== 前端 API 服务示例 =====

class UserService {
  private baseUrl = '/api/users'

  // 创建用户 - 使用纯 TypeScript 类型
  async createUser(userData: CreateUserInput): Promise<ApiResponse<UserDto>> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return response.json()
  }

  // 获取用户列表 - 使用分页类型
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<UserDto>> {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${searchParams}`)
    return response.json()
  }
}

// ===== 认证服务示例 =====

class AuthService {
  private baseUrl = '/api/auth'

  // 登录 - 使用纯 TypeScript 类型
  async login(credentials: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    return response.json()
  }

  // 注册 - 使用纯 TypeScript 类型
  async register(userData: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    return response.json()
  }

  // 获取当前用户信息 - 使用 JWT 类型
  getCurrentUser(): JwtPayload | null {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      // 解析 JWT token（这里简化处理，实际应该使用专门的 JWT 解析库）
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload as JwtPayload
    } catch {
      return null
    }
  }
}

// ===== Vue 3 Composition API 示例 =====

// import { ref, computed } from 'vue' // 在实际项目中取消注释

// 为了示例目的，我们模拟 Vue 的响应式函数
const ref = <T>(value: T) => ({ value })
const computed = <T>(fn: () => T) => ({ value: fn() })

// 用户管理 Composable
export function useUserManagement() {
  const users = ref<UserDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const userService = new UserService()

  const loadUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.getUsers(pagination.value)
      users.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load users'
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: CreateUserInput) => {
    loading.value = true
    error.value = null

    try {
      const response = await userService.createUser(userData)
      if (response.data) {
        users.value.push(response.data)
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  const totalPages = computed(() => Math.ceil(users.value.length / (pagination.value.limit || 10)))

  return {
    users,
    loading,
    error,
    pagination,
    loadUsers,
    createUser,
    totalPages,
  }
}

// ===== 认证 Composable =====

export function useAuth() {
  const user = ref<JwtPayload | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authService = new AuthService()

  const login = async (credentials: LoginInput) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken)
        user.value = authService.getCurrentUser()
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    user.value = null
  }

  const checkAuth = () => {
    user.value = authService.getCurrentUser()
  }

  const isAdmin = computed(() => user.value?.role === 'admin')

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAdmin,
  }
}

// ===== 类型安全的表单验证示例 =====

// 前端表单验证函数（不依赖 Zod，但类型与后端保持一致）
export function validateCreateUserInput(data: unknown): data is CreateUserInput {
  if (typeof data !== 'object' || data === null) return false

  const obj = data as Record<string, unknown>

  // 验证 email
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) return false

  // 验证 name（可选）
  if (obj.name !== undefined && typeof obj.name !== 'string') return false

  return true
}

// ===== 使用示例 =====

// 在 Vue 组件中使用
/*
<script setup lang="ts">
import { ref } from 'vue'
import { useUserManagement, validateCreateUserInput } from '@/composables/useUserManagement'
import type { CreateUserInput } from '@project/shared-types'

const { users, loading, createUser } = useUserManagement()

const newUser = ref<CreateUserInput>({
  email: '',
  name: ''
})

const handleSubmit = async () => {
  if (!validateCreateUserInput(newUser.value)) {
    alert('请输入有效的用户信息')
    return
  }
  
  try {
    await createUser(newUser.value)
    // 重置表单
    newUser.value = { email: '', name: '' }
  } catch (error) {
    console.error('创建用户失败:', error)
  }
}
</script>
*/
