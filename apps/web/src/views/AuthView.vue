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

          <Alert v-if="authStore.error" class="mb-4" variant="destructive">
            {{ authStore.error }}
          </Alert>

          <Button type="submit" class="w-full" :disabled="authStore.loading">
            {{ authStore.loading ? '处理中...' : isLogin ? '登录' : '注册' }}
          </Button>
        </form>

        <div class="mt-4 text-center">
          <button type="button" class="text-blue-600 hover:underline" @click="toggleMode">
            {{ isLogin ? '没有账号？点击注册' : '已有账号？点击登录' }}
          </button>
        </div>

        <div v-if="authStore.user" class="mt-6 p-4 bg-green-50 rounded">
          <h3 class="font-semibold mb-2">当前用户信息：</h3>
          <p>邮箱: {{ authStore.user.email }}</p>
          <p>角色: {{ authStore.user.role }}</p>
          <Button class="mt-2" variant="outline" @click="logout">退出登录</Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, Input, Button, Alert } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput } from '@shared-types'

const authStore = useAuthStore()

const isLogin = ref(true)
const form = ref<LoginInput & { name?: string }>({
  email: '',
  password: '',
  name: '',
})

const handleSubmit = async () => {
  let success: boolean

  // 获取重定向路径
  const redirectPath = authStore.getRedirectPath()

  if (isLogin.value) {
    success = await authStore.login(
      {
        email: form.value.email,
        password: form.value.password,
      },
      redirectPath
    )
  } else {
    success = await authStore.register(
      {
        email: form.value.email,
        password: form.value.password,
        name: form.value.name,
      },
      redirectPath
    )
  }

  if (success) {
    // 重置表单
    form.value = { email: '', password: '', name: '' }
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.clearError()
  form.value = { email: '', password: '', name: '' }
}

const logout = async () => {
  await authStore.logout()
}

onMounted(() => {
  // 初始化认证状态
  authStore.init()
})
</script>
