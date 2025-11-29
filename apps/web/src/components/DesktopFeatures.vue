<template>
  <div class="desktop-features">
    <h2>桌面端功能</h2>

    <div v-if="isDesktop" class="feature-list">
      <div class="feature-item">
        <h3>窗口控制</h3>
        <button @click="minimizeWindow">最小化</button>
        <button @click="maximizeWindow">最大化</button>
        <button @click="setWindowTitle">设置标题</button>
      </div>

      <div class="feature-item">
        <h3>系统信息</h3>
        <button @click="getAppInfo">获取应用信息</button>
        <button @click="getEnvironment">获取环境信息</button>
      </div>

      <div class="feature-item">
        <h3>文件操作</h3>
        <button @click="showOpenDialog">打开文件</button>
        <button @click="showSaveDialog">保存文件</button>
      </div>

      <div class="feature-item">
        <h3>Go 后端调用</h3>
        <input v-model="greetName" placeholder="输入名称" />
        <button @click="greet">问候</button>
        <p v-if="greetResult" class="result">{{ greetResult }}</p>
      </div>
    </div>

    <div v-else class="web-notice">
      <p>当前运行在 Web 环境中，桌面端功能不可用。</p>
      <p>请使用桌面应用体验完整功能。</p>
    </div>

    <div class="environment-info">
      <h3>环境信息</h3>
      <p>运行环境: {{ isDesktop ? '桌面端' : 'Web 端' }}</p>
      <p>平台: {{ platform }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import type { WailsApp, WailsRuntime } from '@project/shared-types'

// 响应式数据
const isDesktop = ref(false)
const platform = ref('unknown')
const greetName = ref('')
const greetResult = ref('')

// 检查是否在桌面环境中
const checkDesktopEnvironment = () => {
  isDesktop.value = typeof window !== 'undefined' && typeof window.runtime !== 'undefined'
}

// 获取平台信息
const getPlatformInfo = async () => {
  if (isDesktop.value && window.runtime) {
    try {
      const env = await window.runtime.Environment()
      platform.value = env.platform
    } catch (error) {
      console.error('获取平台信息失败:', error)
      platform.value = 'desktop'
    }
  } else {
    platform.value = navigator.platform || 'web'
  }
}

// 窗口控制功能
const minimizeWindow = async () => {
  if (window.runtime) {
    try {
      await window.runtime.WindowMinimise()
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  }
}

const maximizeWindow = async () => {
  if (window.runtime) {
    try {
      await window.runtime.WindowMaximise()
    } catch (error) {
      console.error('最大化窗口失败:', error)
    }
  }
}

const setWindowTitle = async () => {
  if (window.runtime) {
    try {
      await window.runtime.WindowSetTitle('新标题 - ' + new Date().toLocaleTimeString())
    } catch (error) {
      console.error('设置窗口标题失败:', error)
    }
  }
}

// 系统信息
const getAppInfo = async () => {
  if (window.go?.main?.App) {
    try {
      const info = await window.go.main.App.GetAppInfo()
      console.log('应用信息:', info)
      alert(`应用信息: ${JSON.stringify(info, null, 2)}`)
    } catch (error) {
      console.error('获取应用信息失败:', error)
    }
  }
}

const getEnvironment = async () => {
  if (window.runtime) {
    try {
      const env = await window.runtime.Environment()
      console.log('环境信息:', env)
      alert(`环境信息: ${JSON.stringify(env, null, 2)}`)
    } catch (error) {
      console.error('获取环境信息失败:', error)
    }
  }
}

// 文件操作
const showOpenDialog = async () => {
  if (window.runtime) {
    try {
      const result = await window.runtime.FileShowOpenDialog('选择文件', false)
      console.log('选择的文件:', result)
      alert(`选择的文件: ${result.join(', ')}`)
    } catch (error) {
      console.error('打开文件对话框失败:', error)
    }
  }
}

const showSaveDialog = async () => {
  if (window.runtime) {
    try {
      const result = await window.runtime.FileShowSaveDialog('保存文件')
      console.log('保存路径:', result)
      alert(`保存路径: ${result}`)
    } catch (error) {
      console.error('保存文件对话框失败:', error)
    }
  }
}

// Go 后端调用
const greet = async () => {
  if (window.go?.main?.App && greetName.value) {
    try {
      const result = await window.go.main.App.Greet(greetName.value)
      greetResult.value = result
    } catch (error) {
      console.error('调用 Go 函数失败:', error)
      greetResult.value = '调用失败: ' + error
    }
  }
}

// 组件挂载时检查环境
onMounted(() => {
  checkDesktopEnvironment()
  getPlatformInfo()
})
</script>

<style scoped>
.desktop-features {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.feature-list {
  display: grid;
  gap: 20px;
}

.feature-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8fafc;
}

.feature-item h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #1e293b;
}

.feature-item button {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.feature-item button:hover {
  background-color: #2563eb;
}

.feature-item input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
}

.web-notice {
  text-align: center;
  padding: 40px;
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
}

.environment-info {
  margin-top: 20px;
  padding: 16px;
  background-color: #f1f5f9;
  border-radius: 8px;
}

.environment-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #1e293b;
}

.environment-info p {
  margin: 4px 0;
  color: #475569;
}

.result {
  margin-top: 8px;
  padding: 8px;
  background-color: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 4px;
  color: #065f46;
}
</style>
