import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// 路由配置 - 使用懒加载
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      title: '认证',
      requiresAuth: false,
    },
  },
  // API 示例页面
  {
    path: '/api-demo',
    name: 'api-demo',
    component: () => import('@/components/ExampleApiDemo.vue'),
    meta: {
      title: 'API 示例',
      requiresAuth: false,
    },
  },
  // 添加受保护的路由示例
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/HomeView.vue'), // 暂时使用 HomeView 作为示例
    meta: {
      title: '仪表板',
      requiresAuth: true,
    },
  },
  // 添加 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash }
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫 - 处理认证和页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Nest Vue Template`
  }

  // 认证检查逻辑
  const authStore = useAuthStore()

  // 初始化认证状态（如果尚未初始化）
  if (!authStore.user && authStore.isAuthenticated) {
    authStore.init()
  }

  // 检查路由是否需要认证
  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    // 保存目标路由，登录后重定向
    next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    // 如果已认证用户访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router
