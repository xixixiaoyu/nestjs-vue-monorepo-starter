import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ErrorAlert from './ErrorAlert.vue'
import { useErrorStore } from '@/stores/error.store'

describe('ErrorAlert', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    // 创建一个新的 Pinia 实例用于测试
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders error alert when there are errors', () => {
    const errorStore = useErrorStore()

    // 使用 addError 方法而不是直接设置 errors
    errorStore.addError({
      statusCode: 400,
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/test',
      message: 'Test error message',
      error: 'Bad Request',
    })

    errorStore.addError({
      statusCode: 500,
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/test2',
      message: 'Server error',
      error: 'Internal Error',
    })

    const wrapper = mount(ErrorAlert, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.fixed.top-4.right-4.z-50.max-w-sm')).toBeTruthy()
    expect(
      wrapper.findAll('.mb-2.p-4.bg-red-50.border.border-red-200.rounded-lg.shadow-lg')
    ).toHaveLength(2)
  })

  it('does not render when there are no errors', () => {
    const errorStore = useErrorStore()

    // 清除所有错误
    errorStore.clearErrors()

    const wrapper = mount(ErrorAlert, {
      global: {
        plugins: [pinia],
      },
    })

    // 组件存在但不渲染内容（v-if="false"）
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.fixed.top-4.right-4.z-50.max-w-sm').exists()).toBe(false)
  })

  it('removes error when close button is clicked', async () => {
    const errorStore = useErrorStore()
    const errorToRemove = {
      statusCode: 400,
      timestamp: '2023-01-01T00:00:00.000Z',
      path: '/api/test',
      message: 'Test error message',
      error: 'Bad Request',
    }

    // 使用 addError 方法而不是直接设置 errors
    errorStore.addError(errorToRemove)

    const wrapper = mount(ErrorAlert, {
      global: {
        plugins: [pinia],
      },
    })

    const closeButton = wrapper
      .findAll('button')
      .find((button: any) => button.text().includes('关闭'))

    expect(closeButton).toBeTruthy()

    if (closeButton) {
      await closeButton.trigger('click')
    }

    expect(wrapper.find('.fixed.top-4.right-4.z-50.max-w-sm').exists()).toBe(false)
  })
})
