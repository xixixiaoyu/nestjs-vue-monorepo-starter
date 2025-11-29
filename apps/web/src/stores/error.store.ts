import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { ApiError } from '@shared-types'

export const useErrorStore = defineStore('error', () => {
  const errors = ref<ApiError[]>([])
  const currentError = ref<ApiError | null>(null)

  const hasErrors = computed(() => errors.value.length > 0)
  const errorMessage = computed(() => currentError.value?.message || '')

  const addError = (error: ApiError) => {
    errors.value.push(error)
    currentError.value = error

    // 自动清除错误，5秒后
    setTimeout(() => {
      removeError(error)
    }, 5000)
  }

  const removeError = (error: ApiError) => {
    const index = errors.value.findIndex(
      (e) =>
        e.statusCode === error.statusCode && e.message === error.message && e.path === error.path
    )
    if (index > -1) {
      errors.value.splice(index, 1)
    }

    if (currentError.value === error) {
      currentError.value = null
    }
  }

  const clearErrors = () => {
    errors.value = []
    currentError.value = null
  }

  const clearCurrentError = () => {
    currentError.value = null
  }

  return {
    errors: readonly(errors),
    currentError: readonly(currentError),
    hasErrors,
    errorMessage,
    addError,
    removeError,
    clearErrors,
    clearCurrentError,
  }
})
