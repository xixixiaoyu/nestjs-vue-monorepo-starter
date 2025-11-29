<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-gray-50">
    <el-card class="w-full max-w-md">
      <h1 class="text-2xl font-bold mb-4">Nest + Vue Monorepo</h1>
      <el-button type="primary" @click="loadHealth">检查 API 健康</el-button>
      <div v-if="health" class="mt-4">
        <p>status: {{ health.status }}</p>
        <p>timestamp: {{ health.timestamp }}</p>
      </div>
      <el-divider class="my-6" />
      <div>
        <h2 class="text-xl font-semibold mb-2">Users</h2>
        <div class="flex gap-2 mb-3">
          <el-input v-model="userForm.email" placeholder="email" />
          <el-input v-model="userForm.name" placeholder="name (optional)" />
          <el-button type="success" @click="createUser">创建用户</el-button>
        </div>
        <el-alert v-if="error" :title="error" type="error" show-icon class="mb-3" />
        <el-button @click="loadUsers">加载用户列表</el-button>
        <ul class="mt-3 list-disc pl-5" v-if="users.length">
          <li v-for="u in users" :key="u.id">{{ u.email }} — {{ u.name ?? 'N/A' }}</li>
        </ul>
      </div>
    </el-card>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'

const health = ref<{ status: string; timestamp: string } | null>(null)
const users = ref<any[]>([])
const error = ref<string>('')
const userForm = ref({ email: '', name: '' })

const loadHealth = async () => {
  const res = await fetch('/api/health')
  health.value = await res.json()
}

const loadUsers = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error(await res.text())
    users.value = await res.json()
  } catch (e: any) {
    error.value = e?.message || '请求失败'
  }
}

const createUser = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userForm.value.email, name: userForm.value.name || undefined })
    })
    if (!res.ok) throw new Error(await res.text())
    userForm.value.email = ''
    userForm.value.name = ''
    await loadUsers()
  } catch (e: any) {
    error.value = e?.message || '请求失败'
  }
}
</script>
