/**
 * 统一 API 服务
 * 在 Web 和 Desktop 环境中提供一致的接口
 */

import { isDesktop, EnvironmentApi } from '@/utils/environment'
import type { ApiResponse, UserDto, HealthDto } from '@project/shared-types'

/**
 * 统一 API 服务类
 */
export class UnifiedApiService {
  private baseUrl: string

  constructor() {
    // 根据环境设置不同的基础 URL
    this.baseUrl = isDesktop()
      ? 'http://localhost:3001' // 桌面端直连后端
      : '/api' // Web 端使用 Vite 代理
  }

  /**
   * 获取应用健康状态
   */
  async getHealth(): Promise<ApiResponse<HealthDto>> {
    return EnvironmentApi.call(
      // 桌面端：如果有的话，可以使用 Wails API
      async () => {
        // 这里可以调用 Wails 特定的健康检查
        // 暂时还是使用 HTTP API
        return this.httpGet<HealthDto>('/health')
      },
      // Web 端：使用 HTTP API
      () => this.httpGet<HealthDto>('/health')
    )
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<UserDto>> {
    return this.httpGet<UserDto>('/users/me')
  }

  /**
   * 获取应用信息（桌面端和 Web 端不同实现）
   */
  async getAppInfo(): Promise<Record<string, any>> {
    return EnvironmentApi.call(
      // 桌面端：使用 Wails API
      async () => {
        if (window.go?.main?.App) {
          return await window.go.main.App.GetAppInfo()
        }
        throw new Error('Wails API 不可用')
      },
      // Web 端：使用 HTTP API
      async () => {
        return this.httpGet<Record<string, any>>('/app/info')
      }
    )
  }

  /**
   * 文件操作（仅桌面端）
   */
  async selectFile(_filters?: Array<{ displayName: string; pattern: string }>): Promise<string[]> {
    if (!isDesktop()) {
      throw new Error('文件选择仅在桌面端可用')
    }

    if (!window.runtime?.FileShowOpenDialog) {
      throw new Error('文件操作 API 不可用')
    }

    return await window.runtime.FileShowOpenDialog('选择文件', false)
  }

  /**
   * 保存文件（仅桌面端）
   */
  async saveFile(defaultFilename?: string): Promise<string> {
    if (!isDesktop()) {
      throw new Error('文件保存仅在桌面端可用')
    }

    if (!window.runtime?.FileShowSaveDialog) {
      throw new Error('文件操作 API 不可用')
    }

    return await window.runtime.FileShowSaveDialog(defaultFilename || '文件')
  }

  /**
   * 显示通知（仅桌面端）
   */
  async showNotification(title: string, body: string): Promise<void> {
    if (!isDesktop()) {
      // Web 端使用浏览器通知
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, { body })
            }
          })
        }
      }
      return
    }

    // 桌面端可以使用系统通知
    // 这里可以扩展 Wails 的通知功能
    // eslint-disable-next-line no-console
    console.log(`桌面通知: ${title} - ${body}`)
  }

  /**
   * 窗口控制（仅桌面端）
   */
  async controlWindow(action: 'minimize' | 'maximize' | 'unmaximize' | 'close'): Promise<void> {
    if (!isDesktop()) {
      throw new Error('窗口控制仅在桌面端可用')
    }

    if (!window.runtime) {
      throw new Error('窗口控制 API 不可用')
    }

    switch (action) {
      case 'minimize':
        await window.runtime.WindowMinimise()
        break
      case 'maximize':
        await window.runtime.WindowMaximise()
        break
      case 'unmaximize':
        await window.runtime.WindowUnmaximise()
        break
      case 'close':
        await window.runtime.Quit()
        break
    }
  }

  /**
   * 通用 HTTP GET 请求
   */
  private async httpGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 支持 Cookie
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('HTTP GET 请求失败:', error)
      throw error
    }
  }

  /**
   * 通用 HTTP POST 请求
   */
  private async httpPost<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // 支持 Cookie
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('HTTP POST 请求失败:', error)
      throw error
    }
  }

  /**
   * 通用 HTTP PUT 请求
   */
  private async httpPut<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // 支持 Cookie
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('HTTP PUT 请求失败:', error)
      throw error
    }
  }

  /**
   * 通用 HTTP DELETE 请求
   */
  private async httpDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 支持 Cookie
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('HTTP DELETE 请求失败:', error)
      throw error
    }
  }
}

// 创建单例实例
export const apiService = new UnifiedApiService()

// 导出类型
export type ApiService = UnifiedApiService
