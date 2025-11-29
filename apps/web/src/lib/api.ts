import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse, ApiError, JwtPayload } from '@shared-types'

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器 - 添加认证 token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器 - 处理错误和 token 刷新
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error) => {
      const originalRequest = error.config

      // 处理 401 错误 - 尝试刷新 token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken,
            })

            const { accessToken } = response.data
            localStorage.setItem('accessToken', accessToken)

            // 重新发送原始请求
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          // 刷新失败，清除 token 并跳转到登录页
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    }
  )

  return instance
}

export const apiClient = createApiInstance()

// API 请求封装函数
export class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = apiClient
  }

  // GET 请求
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return (response.data.data as T) || (response.data as T)
  }

  // POST 请求
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return (response.data.data as T) || (response.data as T)
  }

  // PUT 请求
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return (response.data.data as T) || (response.data as T)
  }

  // PATCH 请求
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return (response.data.data as T) || (response.data as T)
  }

  // DELETE 请求
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return (response.data.data as T) || (response.data as T)
  }

  // 文件上传
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })

    return (response.data.data as T) || (response.data as T)
  }
}

// 创建默认 API 客户端实例
export const api = new ApiClient()

// 错误处理工具函数
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // 服务器响应错误
    return {
      statusCode: error.response.status,
      timestamp: new Date().toISOString(),
      path: error.response.config?.url || '',
      message: error.response.data?.message || '服务器错误',
      error: error.response.data?.error,
    }
  } else if (error.request) {
    // 网络错误
    return {
      statusCode: 0,
      timestamp: new Date().toISOString(),
      path: '',
      message: '网络连接失败，请检查网络设置',
    }
  } else {
    // 其他错误
    return {
      statusCode: -1,
      timestamp: new Date().toISOString(),
      path: '',
      message: error.message || '未知错误',
    }
  }
}

// JWT 工具函数
export const jwtUtils = {
  // 解析 JWT token
  parseToken(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  },

  // 检查 token 是否过期
  isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token)
    if (!payload || !payload.exp) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  },

  // 获取当前用户信息
  getCurrentUser(): JwtPayload | null {
    const token = localStorage.getItem('accessToken')
    if (!token || this.isTokenExpired(token)) return null
    return this.parseToken(token)
  },
}
