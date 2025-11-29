<template>
  <div class="min-h-screen flex items-center justify-center p-8 bg-gray-50">
    <Card class="w-full max-w-md text-center">
      <div class="p-6">
        <div class="text-6xl font-bold text-gray-400 mb-4">404</div>
        <h1 class="text-2xl font-bold mb-4">页面未找到</h1>
        <p class="text-gray-600 mb-6">抱歉，您访问的页面不存在或已被移除。</p>
        <Button class="w-full" @click="goHome"> 返回首页 </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Card, Button } from '@/components/ui'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>
