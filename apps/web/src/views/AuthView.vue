<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-gray-50">
    <Card class="w-full max-w-md">
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-6 text-center">
          {{ isLogin ? '登录' : '注册' }}
        </h1>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <Input v-model="form.email" type="email" placeholder="邮箱" required />
          </div>

          <div>
            <Input v-model="form.password" type="password" placeholder="密码" required />
          </div>

          <div v-if="!isLogin">
            <Input v-model="form.name" type="text" placeholder="姓名（可选）" />
          </div>

          <Alert v-if="error" class="mb-4" variant="destructive">
            {{ error }}
          </Alert>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <button type="button" class="text-blue-600 hover:underline" @click="toggleMode">
            {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
          </button>
        </div>

        <div v-if="user" class="mt-6 p-4 bg-green-50 rounded">
          <h3 class="font-semibold mb-2">当前用户信息：</h3>
          <p>邮箱: {{ user.email }}</p>
          <p>角色: {{ user.role }}</p>
          <Button class="mt-2" variant="outline" @click="logout">退出登录</Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Input, Button, Alert } from '@/components/ui'
import { api, handleApiError, jwtUtils } from '@/lib/api'
import type { LoginInput, AuthResponse, JwtPayload } from '@shared-types'

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const user = ref<JwtPayload | null>(null)

const form = ref<LoginInput & { name?: string }>({
  email: '',
  password: '',
  name: '',
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    let response: AuthResponse

    if (isLogin.value) {
      response = await api.post<AuthResponse>('/auth/login', {
        email: form.value.email,
        password: form.value.password,
      })
    } else {
      response = await api.post<AuthResponse>('/auth/register', {
        email: form.value.email,
        password: form.value.password,
        name: form.value.name,
      })
    }

    // 保存 token 到 localStorage
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)

    // 获取当前用户信息
    user.value = jwtUtils.getCurrentUser()

    // 重置表单
    form.value = { email: '', password: '', name: '' }
  } catch (e: any) {
    error.value = handleApiError(e).message
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  form.value = { email: '', password: '', name: '' }
}

const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken })
    }
  } catch (e) {
    console.error('Logout error:', e)
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
  }
}

onMounted(() => {
  // 检查是否已登录
  user.value = jwtUtils.getCurrentUser()
})
</script>
