/**
 * 示例 API 服务
 * 展示如何使用新的 HTTP 封装和 TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { http } from '@/utils/http'
import type { UserDto } from '@shared-types'

// 定义查询键
const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  health: ['health'] as const,
}

// API 请求函数
export const userApi = {
  // 获取所有用户
  getUsers: () => http.get<UserDto[]>('/users'),

  // 获取单个用户
  getUser: (id: string) => http.get<UserDto>(`/users/${id}`),

  // 创建用户
  createUser: (userData: Partial<UserDto>) => http.post<UserDto>('/users', userData),

  // 更新用户
  updateUser: (id: string, userData: Partial<UserDto>) =>
    http.put<UserDto>(`/users/${id}`, userData),

  // 删除用户
  deleteUser: (id: string) => http.delete<void>(`/users/${id}`),

  // 获取健康状态
  getHealth: () => http.get<{ status: string }>('/health'),
}

// TanStack Query Hooks

// 获取所有用户的 Hook
export const useUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: userApi.getUsers,
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

// 获取单个用户的 Hook
export const useUser = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id, // 只有当 id 存在时才执行查询
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

// 创建用户的 Mutation Hook
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      // 创建成功后，刷新用户列表
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
    },
  })
}

// 更新用户的 Mutation Hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<UserDto> }) =>
      userApi.updateUser(id, userData),
    onSuccess: (_, { id }) => {
      // 更新成功后，刷新用户列表和特定用户
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(id) })
    },
  })
}

// 删除用户的 Mutation Hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      // 删除成功后，刷新用户列表
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
    },
  })
}

// 获取健康状态的 Hook
export const useHealth = () => {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: userApi.getHealth,
    refetchInterval: 30 * 1000, // 每 30 秒刷新一次
    staleTime: 10 * 1000, // 10 秒
  })
}
