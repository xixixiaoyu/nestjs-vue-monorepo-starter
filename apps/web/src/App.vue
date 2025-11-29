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
            <Input v-model="userForm.name" placeholder="name (optional)" />
            <Button class="bg-green-600 hover:bg-green-700" @click="createUser">创建用户</Button>
          </div>
          <Alert v-if="error" class="mb-3" variant="destructive">{{ error }}</Alert>
          <Button variant="outline" @click="loadUsers">加载用户列表</Button>
          <ul class="mt-3 list-disc pl-5" v-if="users.length">
            <li v-for="u in users" :key="u.id">{{ u.email }} — {{ u.name ?? 'N/A' }}</li>
          </ul>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Card, Input, Alert } from '@/components/ui'

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
      body: JSON.stringify({ email: userForm.value.email, name: userForm.value.name || undefined }),
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
