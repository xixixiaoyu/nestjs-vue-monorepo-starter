<template>
  <div class="min-h-screen">
    <RouterView />
    <ErrorAlert />
  </div>
</template>

<script setup lang="ts">
import ErrorAlert from '@/components/ErrorAlert.vue'
// 这里可以添加全局逻辑
</script>
