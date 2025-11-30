<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-gray-50">
    <Card class="w-full max-w-md">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Nest + Vue Monorepo</h1>
        <Button class="mb-4" @click="loadHealth">检查 API 健康</Button>
        <div v-if="health" class="mt-2 space-y-1">
          <p>status: {{ health.status }}</p>
          <p>timestamp: {{ health.timestamp }}</p>
        </div>
        <div class="my-6 border-t" />
        <div>
          <h2 class="text-xl font-semibold mb-2">Users</h2>
          <div class="flex gap-2 mb-3">
            <Input v-model="userForm.email" placeholder="email" />
            <Input
              :model-value="userForm.name || ''"
              placeholder="name (optional)"
              @update:model-value="userForm.name = typeof $event === 'string' ? $event : undefined"
            />
            <Button class="bg-green-600 hover:bg-green-700" @click="createUser">创建用户</Button>
          </div>
          <Alert v-if="error" class="mb-3" variant="destructive">{{ error }}</Alert>
          <Button variant="outline" @click="loadUsers">加载用户列表</Button>
          <ul v-if="users.length" class="mt-3 list-disc pl-5">
            <li v-for="u in users" :key="u.id">{{ u.email }} — {{ u.name ?? 'N/A' }}</li>
          </ul>
        </div>
        <div class="mt-6 pt-6 border-t space-y-2">
          <Button variant="outline" @click="$router.push('/auth')"> 前往登录/注册页面 </Button>
          <Button variant="outline" @click="$router.push('/api-demo')" class="ml-2">
            查看 API 示例 (Axios + TanStack Query)
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input, Alert } from '@/components/ui'
import { api, handleApiError } from '@/lib/api'
import type { HealthDto, UserDto, CreateUserInput } from '@shared-types'

const health = ref<HealthDto | null>(null)
const users = ref<UserDto[]>([])
const error = ref<string>('')
const userForm = ref<CreateUserInput>({ email: '', name: '' })

const loadHealth = async () => {
  try {
    health.value = await api.get<HealthDto>('/health')
  } catch (e: any) {
    error.value = handleApiError(e).message
  }
}

const loadUsers = async () => {
  error.value = ''
  try {
    users.value = await api.get<UserDto[]>('/users')
  } catch (e: any) {
    error.value = handleApiError(e).message
  }
}

const createUser = async () => {
  error.value = ''
  try {
    await api.post<UserDto>('/users', {
      email: userForm.value.email,
      name: userForm.value.name || undefined,
    })
    userForm.value.email = ''
    userForm.value.name = ''
    await loadUsers()
  } catch (e: any) {
    error.value = handleApiError(e).message
  }
}
</script>
