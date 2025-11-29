<template>
  <div v-if="errorStore.hasErrors" class="fixed top-4 right-4 z-50 max-w-sm">
    <div
      v-for="error in errorStore.errors"
      :key="`${error.statusCode}-${error.path}`"
      class="mb-2 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg"
      :class="{
        'bg-red-100': error.statusCode >= 500,
        'bg-yellow-100': error.statusCode >= 400 && error.statusCode < 500,
        'bg-blue-100': error.statusCode < 400,
      }"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-6 w-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">错误 {{ error.statusCode }}</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error.message }}</p>
            <p v-if="error.path" class="text-xs mt-1">路径: {{ error.path }}</p>
          </div>
          <div class="mt-4 flex">
            <button
              class="text-sm text-red-600 hover:text-red-800 font-medium"
              @click="errorStore.removeError(error)"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useErrorStore } from '@/stores/error.store'

const errorStore = useErrorStore()
</script>
