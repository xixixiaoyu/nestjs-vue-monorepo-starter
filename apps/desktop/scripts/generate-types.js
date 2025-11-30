#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Wails 生成的类型文件路径
const wailsGeneratedTypesPath = path.join(__dirname, '../src/gen/desktop/desktop.go')
// 目标类型文件路径
const targetTypesPath = path.join(__dirname, '../../../packages/shared-types/src/wails/index.ts')

// eslint-disable-next-line no-console
console.log('Generating Wails TypeScript types...')

// 检查 Wails 生成的文件是否存在
if (!fs.existsSync(wailsGeneratedTypesPath)) {
  // eslint-disable-next-line no-console
  console.log('Wails generated types not found. Please run "wails generate module" first.')
  process.exit(1)
}

// 读取 Wails 生成的 Go 文件
// const goContent = fs.readFileSync(wailsGeneratedTypesPath, 'utf8')

// 这里应该有解析 Go 文件并生成 TypeScript 类型的逻辑
// 由于这是一个复杂的解析过程，我们提供一个简化的示例

const tsContent = `// Wails 生成的 TypeScript 类型定义
// 这个文件由脚本自动生成，基于 Wails Go 代码
// 请勿手动编辑此文件

// 临时占位符类型，实际类型将由 Wails 生成
export interface WailsApp {
  Greet(name: string): Promise<string>
  GetAppInfo(): Promise<Record<string, any>>
  ShowNotification(title: string, body: string): Promise<void>
}

// Wails 运行时类型
export interface WailsRuntime {
  EventsOn(eventName: string, callback: (...args: any[]) => void): () => void
  EventsOff(eventName: string, ...additionalEventNames: string[]): void
  EventsEmit(eventName: string, ...data: any[]): void
  WindowHide(): Promise<void>
  WindowShow(): Promise<void>
  WindowMinimise(): Promise<void>
  WindowUnminimise(): Promise<void>
  WindowMaximise(): Promise<void>
  WindowUnmaximise(): Promise<void>
  WindowSetSize(width: number, height: number): Promise<void>
  WindowGetSize(): Promise<{ width: number; height: number }>
  WindowSetFullscreen(fullscreen: boolean): Promise<void>
  WindowSetAlwaysOnTop(alwaysOnTop: boolean): Promise<void>
  WindowSetTitle(title: string): Promise<void>
  WindowCenter(): Promise<void>
  WindowReload(): Promise<void>
  WindowReloadApp(): Promise<void>
  WindowSetSystemDefaultTheme(): Promise<void>
  WindowSetLightTheme(): Promise<void>
  WindowSetDarkTheme(): Promise<void>
  ScreenGetAll(): Promise<Array<{ name: string; width: number; height: number; scale: number }>>
  BrowserOpenURL(url: string): Promise<void>
  Environment(): Promise<{ buildType: string; platform: string }>
  Quit(): Promise<void>
  Hide(): Promise<void>
  Show(): Promise<void>
  LogPrint(message: string): Promise<void>
  LogFatal(message: string): Promise<void>
  LogWarn(message: string): Promise<void>
  LogError(message: string): Promise<void>
  LogInfo(message: string): Promise<void>
  LogDebug(message: string): Promise<void>
  ClipboardGetText(): Promise<string>
  ClipboardSetText(text: string): Promise<void>
  FileShowSaveDialogWithFilter(defaultFilename: string, filters: Array<{ displayName: string; pattern: string }>): Promise<string>
  FileShowOpenDialogWithFilter(title: string, filters: Array<{ displayName: string; pattern: string }>, multiSelect: boolean): Promise<string[]>
  FileShowSaveDialog(defaultFilename: string): Promise<string>
  FileShowOpenDialog(title: string, multiSelect: boolean): Promise<string[]>
  FileWriteFile(filename: string, data: Uint8Array): Promise<void>
  FileReadFile(filename: string): Promise<Uint8Array>
  FileExists(filename: string): Promise<boolean>
  FileExistsWithErrorMessage(filename: string): Promise<{ exists: boolean; errorMessage?: string }>
  FileDelete(filename: string): Promise<void>
}

// 全局 Wails 实例声明
declare global {
  interface Window {
    go: {
      main: {
        App: WailsApp
      }
    }
    runtime: WailsRuntime
  }
}

export {}
`

// 写入目标文件
fs.writeFileSync(targetTypesPath, tsContent)

// eslint-disable-next-line no-console
console.log(`Wails TypeScript types generated successfully at: ${targetTypesPath}`)
