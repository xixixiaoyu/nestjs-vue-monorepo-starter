// Wails 生成的 TypeScript 类型定义
// 这个文件将由 Wails 自动生成和更新
// 请勿手动编辑此文件

// 临时占位符类型，实际类型将由 Wails 生成
export interface WailsApp {
  Greet(name: string): Promise<string>
  GetAppInfo(): Promise<Record<string, any>>
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
  FileShowSaveDialogWithFilter(
    defaultFilename: string,
    filters: Array<{ displayName: string; pattern: string }>
  ): Promise<string>
  FileShowOpenDialogWithFilter(
    title: string,
    filters: Array<{ displayName: string; pattern: string }>,
    multiSelect: boolean
  ): Promise<string[]>
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
