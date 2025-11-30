import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { api, jwtUtils } from '@/lib/api'
import type { LoginInput, RegisterInput, AuthResponse, JwtPayload } from '@shared-types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<JwtPayload | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const userEmail = computed(() => user.value?.email || '')

  // 初始化 - 检查本地存储的令牌
  const init = () => {
    const currentUser = jwtUtils.getCurrentUser()
    if (currentUser) {
      user.value = currentUser
    }
  }

  // 登录
  const login = async (credentials: LoginInput, redirectPath?: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)

      // 令牌会通过 httpOnly Cookie 自动设置，这里只需要设置访问令牌
      jwtUtils.setAccessToken(response.accessToken)
      user.value = jwtUtils.getCurrentUser()

      // 登录成功后重定向
      if (redirectPath) {
        window.location.href = redirectPath
      } else if (window.location.pathname === '/auth') {
        // 如果在登录页，重定向到首页
        window.location.href = '/'
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterInput, redirectPath?: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>('/auth/register', userData)

      // 令牌会通过 httpOnly Cookie 自动设置，这里只需要设置访问令牌
      jwtUtils.setAccessToken(response.accessToken)
      user.value = jwtUtils.getCurrentUser()

      // 注册成功后重定向
      if (redirectPath) {
        window.location.href = redirectPath
      } else if (window.location.pathname === '/auth') {
        // 如果在注册页，重定向到首页
        window.location.href = '/'
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || '注册失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.post('/auth/logout', {})
    } catch (err: any) {
      // 使用 ESLint 注释禁用 no-console 规则，因为这是前端错误日志
      // eslint-disable-next-line no-console
      console.error('Logout error:', err)
    } finally {
      // 清除本地状态和令牌
      jwtUtils.clearTokens()
      user.value = null
      loading.value = false
    }
  }

  // 刷新用户信息
  const refreshUser = (): void => {
    const currentUser = jwtUtils.getCurrentUser()
    user.value = currentUser
  }

  // 清除错误
  const clearError = (): void => {
    error.value = null
  }

  // 检查重定向路径
  const getRedirectPath = (): string => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('redirect') || '/'
  }

  return {
    // 状态（只读）
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),

    // 计算属性
    isAuthenticated,
    userRole,
    userEmail,

    // 方法
    init,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    getRedirectPath,
  }
})
