// 简单的性能监控工具
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name) {
            const metric: PerformanceMetric = {
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
            }
            this.metrics.push(metric)
            // eslint-disable-next-line no-console
            console.log(`Performance: ${metric.name} = ${metric.value}ms`)
          }
        }
      })

      this.observer.observe({ entryTypes: ['measure'] })
    }
  }

  // 开始测量
  startMeasure(name: string): void {
    if (this.observer) {
      performance.mark(`${name}-start`)
    }
  }

  // 结束测量
  endMeasure(name: string): void {
    if (this.observer) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }

  // 获取指标
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics = []
  }

  // 获取平均性能
  getAverageMetric(name: string): number | null {
    const metrics = this.metrics.filter((m) => m.name === name)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  // 记录自定义指标
  recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    }
    this.metrics.push(metric)
    // eslint-disable-next-line no-console
    console.log(`Performance: ${name} = ${value}`)
  }

  // 监控页面加载时间
  measurePageLoad(): void {
    this.startMeasure('page-load')

    window.addEventListener(
      'load',
      () => {
        this.endMeasure('page-load')
      },
      { once: true }
    )
  }

  // 监控 API 请求时间
  measureApiCall<T>(
    fn: (...args: any[]) => Promise<T>,
    name: string
  ): (...args: any[]) => Promise<T> {
    return async (...args: any[]): Promise<T> => {
      this.startMeasure(`api-${name}`)

      try {
        const result = await fn(...args)
        this.endMeasure(`api-${name}`)
        this.recordMetric(`api-${name}-success`, 1)
        return result
      } catch (error) {
        this.endMeasure(`api-${name}-error`)
        this.recordMetric(`api-${name}-error`, 0)
        throw error
      }
    }
  }
}

// 创建性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 性能监控装饰器
export const measurePerformance = <T extends any[]>(
  name: string,
  fn: (...args: any[]) => Promise<T>
) => {
  return performanceMonitor.measureApiCall(fn, name)
}

// 导出性能监控工具
export { PerformanceMonitor }
