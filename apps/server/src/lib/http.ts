import { ofetch } from 'ofetch'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

/**
 * HTTP 请求配置接口
 */
export interface HttpConfig {
  baseURL?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

/**
 * HTTP 响应接口
 */
export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

/**
 * 统一的 HTTP 请求服务
 * 基于 ofetch 提供更好的错误处理和重试机制
 */
@Injectable()
export class HttpService {
  private defaultConfig: HttpConfig

  constructor(private readonly configService: ConfigService) {
    this.defaultConfig = {
      timeout: this.configService.get<number>('HTTP_TIMEOUT', 30000),
      retries: this.configService.get<number>('HTTP_RETRIES', 3),
      retryDelay: this.configService.get<number>('HTTP_RETRY_DELAY', 1000),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.configService.get<string>('HTTP_USER_AGENT', 'NestJS-Server/1.0'),
      },
    }
  }

  /**
   * 发送 GET 请求
   * @param url 请求 URL
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async get<T = any>(url: string, config: HttpConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config)
  }

  /**
   * 发送 POST 请求
   * @param url 请求 URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async post<T = any>(url: string, data?: any, config: HttpConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config)
  }

  /**
   * 发送 PUT 请求
   * @param url 请求 URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async put<T = any>(url: string, data?: any, config: HttpConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config)
  }

  /**
   * 发送 PATCH 请求
   * @param url 请求 URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async patch<T = any>(url: string, data?: any, config: HttpConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config)
  }

  /**
   * 发送 DELETE 请求
   * @param url 请求 URL
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async delete<T = any>(url: string, config: HttpConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  /**
   * 统一的请求方法
   * @param method HTTP 方法
   * @param url 请求 URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config: HttpConfig = {}
  ): Promise<HttpResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config }

    try {
      const response = await ofetch.raw<T>(url, {
        method,
        body: data,
        baseURL: finalConfig.baseURL,
        timeout: finalConfig.timeout,
        retry: finalConfig.retries,
        retryDelay: finalConfig.retryDelay,
        headers: { ...finalConfig.headers, ...config.headers },
        onRequestError({ error, request }) {
          console.error(`[HTTP] Request failed: ${method} ${request}`, error)
        },
        onResponseError({ error, request, response }) {
          console.error(`[HTTP] Response error: ${method} ${request} - ${response.status}`, error)
        },
      })

      return {
        data: response._data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      }
    } catch (error) {
      // 统一错误处理
      if (error instanceof Error) {
        throw new Error(`HTTP request failed: ${method} ${url} - ${error.message}`)
      }
      throw new Error(`HTTP request failed: ${method} ${url} - Unknown error`)
    }
  }

  /**
   * 创建带有预设配置的 HTTP 客户端
   * @param config 预设配置
   * @returns 新的 HttpService 实例
   */
  createClient(config: HttpConfig): HttpService {
    const client = new HttpService(this.configService)
    client.defaultConfig = { ...this.defaultConfig, ...config }
    return client
  }
}

// 导出 ofetch 以便直接使用
export { ofetch }
