<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">API 示例演示</h1>

    <!-- 健康状态 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>健康状态</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="healthQuery.isLoading.value">
          <div class="h-4 w-[250px] bg-gray-200 rounded animate-pulse mb-2"></div>
        </div>
        <div v-else-if="healthQuery.error.value">
          <Alert variant="destructive">
            <AlertTitle>获取健康状态失败</AlertTitle>
            <AlertDescription>{{ healthQuery.error.value.message }}</AlertDescription>
          </Alert>
        </div>
        <div v-else>
          <p>状态: {{ healthQuery.data.value?.status || '未知' }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- 用户列表 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>用户列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="usersQuery.isLoading.value">
          <div class="h-4 w-[250px] bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div v-else-if="usersQuery.error.value">
          <Alert variant="destructive">
            <AlertTitle>获取用户列表失败</AlertTitle>
            <AlertDescription>{{ usersQuery.error.value.message }}</AlertDescription>
          </Alert>
        </div>
        <div v-else>
          <div
            v-if="!usersQuery.data.value || usersQuery.data.value.length === 0"
            class="text-gray-500"
          >
            暂无用户数据
          </div>
          <div v-else>
            <div
              v-for="user in usersQuery.data.value"
              :key="user.id"
              class="mb-2 p-2 border rounded"
            >
              <p><strong>ID:</strong> {{ user.id }}</p>
              <p><strong>邮箱:</strong> {{ user.email }}</p>
              <p><strong>姓名:</strong> {{ user.name }}</p>
              <div class="mt-2 space-x-2">
                <Button variant="outline" size="sm" @click="selectUser(user.id)"> 查看详情 </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="deleteUser(user.id)"
                  :disabled="deleteMutation.isPending.value"
                >
                  {{ deleteMutation.isPending.value ? '删除中...' : '删除' }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 创建用户表单 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>创建新用户</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium mb-1">邮箱</label>
            <Input
              id="email"
              v-model="newUser.email"
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div>
            <label for="name" class="block text-sm font-medium mb-1">姓名</label>
            <Input id="name" v-model="newUser.name" type="text" placeholder="请输入姓名" required />
          </div>
          <Button type="submit" :disabled="createMutation.isPending.value">
            {{ createMutation.isPending.value ? '创建中...' : '创建用户' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- 用户详情 -->
    <Card v-if="selectedUserId">
      <CardHeader>
        <CardTitle>用户详情</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="userQuery.isLoading.value">
          <div class="h-4 w-[250px] bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-4 w-[200px] bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div v-else-if="userQuery.error.value">
          <Alert variant="destructive">
            <AlertTitle>获取用户详情失败</AlertTitle>
            <AlertDescription>{{ userQuery.error.value.message }}</AlertDescription>
          </Alert>
        </div>
        <div v-else-if="userQuery.data.value">
          <p><strong>ID:</strong> {{ userQuery.data.value.id }}</p>
          <p><strong>邮箱:</strong> {{ userQuery.data.value.email }}</p>
          <p><strong>姓名:</strong> {{ userQuery.data.value.name }}</p>
          <p><strong>创建时间:</strong> {{ formatDate(userQuery.data.value.createdAt) }}</p>
          <p><strong>更新时间:</strong> {{ formatDate(userQuery.data.value.updatedAt) }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// 移除 Skeleton 导入，使用自定义加载动画
import { useUsers, useUser, useCreateUser, useDeleteUser, useHealth } from '@/services/example-api'

// 响应式数据
const selectedUserId = ref<string>('')
const newUser = ref({
  email: '',
  name: '',
})

// TanStack Query Hooks
const usersQuery = useUsers()
const userQuery = useUser(selectedUserId.value)
const createMutation = useCreateUser()
const deleteMutation = useDeleteUser()
const healthQuery = useHealth()

// 方法
const selectUser = (userId: string) => {
  selectedUserId.value = userId
  // 重新触发用户详情查询
  userQuery.refetch()
}

const createUser = async () => {
  try {
    await createMutation.mutateAsync(newUser.value)
    // 重置表单
    newUser.value = { email: '', name: '' }
  } catch {
    // 错误已经在 HTTP 封装中处理，这里不需要额外处理
  }
}

const deleteUser = async (userId: string) => {
  try {
    await deleteMutation.mutateAsync(userId)
    // 如果删除的是当前选中的用户，清除选中状态
    if (selectedUserId.value === userId) {
      selectedUserId.value = ''
    }
  } catch {
    // 错误已经在 HTTP 封装中处理，这里不需要额外处理
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
