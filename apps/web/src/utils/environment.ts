/**
 * 环境检测工具函数
 * 用于区分 Web 和 Desktop 环境
 */

/**
 * 检查是否在桌面环境中运行
 * @returns boolean
 */
export const isDesktop = (): boolean => {
  return typeof window !== 'undefined' && typeof window.runtime !== 'undefined'
}

/**
 * 检查是否在 Web 环境中运行
 * @returns boolean
 */
export const isWeb = (): boolean => {
  return typeof window !== 'undefined' && !isDesktop()
}

/**
 * 获取当前环境类型
 * @returns 'desktop' | 'web' | 'unknown'
 */
export const getEnvironment = (): 'desktop' | 'web' | 'unknown' => {
  if (typeof window === 'undefined') {
    return 'unknown'
  }

  return isDesktop() ? 'desktop' : 'web'
}

/**
 * 获取平台信息
 * @returns Promise<string>
 */
export const getPlatform = async (): Promise<string> => {
  if (isDesktop() && window.runtime) {
    try {
      const env = await window.runtime.Environment()
      return env.platform
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('获取平台信息失败:', error)
      return 'desktop'
    }
  } else {
    return navigator.platform || 'web'
  }
}

/**
 * 环境特定的 API 调用封装
 */
export class EnvironmentApi {
  /**
   * 调用桌面端特定的 API
   * @param desktopFn 桌面端函数
   * @param webFn Web 端函数
   * @returns Promise<T>
   */
  static async call<T>(desktopFn: () => Promise<T>, webFn: () => Promise<T>): Promise<T> {
    if (isDesktop()) {
      return await desktopFn()
    } else {
      return await webFn()
    }
  }

  /**
   * 条件执行函数
   * @param desktopFn 桌面端函数
   * @param webFn Web 端函数
   */
  static execute(desktopFn: () => void, webFn?: () => void): void {
    if (isDesktop()) {
      desktopFn()
    } else if (webFn) {
      webFn()
    }
  }
}

/**
 * 桌面端功能检测
 */
export const desktopFeatures = {
  /**
   * 检查是否支持窗口控制
   */
  hasWindowControl: (): boolean => {
    return isDesktop() && typeof window.runtime?.WindowMinimise !== 'undefined'
  },

  /**
   * 检查是否支持文件操作
   */
  hasFileOperations: (): boolean => {
    return isDesktop() && typeof window.runtime?.FileShowOpenDialog !== 'undefined'
  },

  /**
   * 检查是否支持 Go 后端调用
   */
  hasGoBackend: (): boolean => {
    return isDesktop() && typeof window.go?.main?.App !== 'undefined'
  },

  /**
   * 检查是否支持系统通知
   */
  hasNotifications: (): boolean => {
    return isDesktop() && typeof window.runtime?.EventsOn !== 'undefined'
  },
}

/**
 * 获取环境特定的配置
 */
export const getEnvironmentConfig = () => {
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD
  const environment = getEnvironment()

  return {
    isDesktop: environment === 'desktop',
    isWeb: environment === 'web',
    isDev,
    isProd,
    apiBaseUrl:
      environment === 'desktop'
        ? 'http://localhost:3001' // 桌面端直连后端
        : import.meta.env.VITE_API_BASE_URL || '/api', // Web 端使用代理
  }
}
