<template>
  <div class="p-4 space-y-2">
    <p class="text-lg font-semibold">Hello, {{ user.name ?? 'User' }}</p>
    <p class="text-sm text-gray-600">ID: {{ user.id }}</p>
    <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
    <p class="text-sm text-gray-600">Created: {{ user.createdAt }}</p>
    <p class="text-sm text-gray-600">Updated: {{ user.updatedAt }}</p>
  </div>
</template>

<script setup lang="ts">
import type { UserDto } from '@shared-types'

const user: UserDto = {
  id: 'u_001',
  email: 'example@example.com',
  name: 'Example',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
</script>
