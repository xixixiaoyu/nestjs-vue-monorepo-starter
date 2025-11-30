import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { toast } from '@/components/ui/use-toast'

// 创建 axios 实例
const createHttpInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // 支持 Cookie
  })

  // 请求拦截器 - 添加认证 token
  instance.interceptors.request.use(
    (config) => {
      // 从 localStorage 或 Pinia 读取 Token
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

  // 响应拦截器 - 处理错误和响应数据解包
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 如果后端返回 { code: 200, data: {...} }，自动剥离外层，直接返回 data
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data
      }
      return response.data
    },
    (error) => {
      // 统一拦截非 200 状态码
      if (error.response) {
        const { status, data } = error.response

        // 401 处理：自动清除 Token 并重定向到登录页
        if (status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')

          // 显示错误提示
          toast({
            title: '认证失败',
            description: '登录已过期，请重新登录',
            variant: 'destructive',
          })

          // 重定向到登录页
          window.location.href = '/auth'
          return Promise.reject(error)
        }

        // 全局提示：使用 Shadcn UI 的 toast 显示错误信息
        const errorMessage = data?.message || data?.error || '请求失败'
        toast({
          title: '错误',
          description: errorMessage,
          variant: 'destructive',
        })
      } else if (error.request) {
        // 网络错误
        toast({
          title: '网络错误',
          description: '网络连接失败，请检查网络设置',
          variant: 'destructive',
        })
      } else {
        // 其他错误
        toast({
          title: '错误',
          description: error.message || '未知错误',
          variant: 'destructive',
        })
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// 创建默认 HTTP 实例
export const httpInstance = createHttpInstance()

// HTTP 请求封装类，优化泛型支持
export class HttpClient {
  private instance: AxiosInstance

  constructor(instance?: AxiosInstance) {
    this.instance = instance || httpInstance
  }

  // GET 请求 - 直接返回数据类型，而不是 AxiosResponse
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  // POST 请求 - 直接返回数据类型，而不是 AxiosResponse
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  // PUT 请求 - 直接返回数据类型，而不是 AxiosResponse
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  // PATCH 请求 - 直接返回数据类型，而不是 AxiosResponse
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  // DELETE 请求 - 直接返回数据类型，而不是 AxiosResponse
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }

  // 文件上传
  async upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })
  }

  // 自定义请求
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config)
  }
}

// 创建默认 HTTP 客户端实例
export const http = new HttpClient()

// 导出类型，方便外部使用
export type { AxiosRequestConfig, AxiosResponse }
