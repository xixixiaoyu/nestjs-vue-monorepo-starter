import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ApiVersion } from './api-version.enum'

// 扩展 Express Request 接口
declare module 'express' {
  export interface Request {
    apiVersion?: string
    apiVersionSource?: string
  }
}

@Injectable()
export class VersioningMiddleware implements NestMiddleware {
  private readonly logger = new Logger(VersioningMiddleware.name)

  use(req: Request, res: Response, next: NextFunction): void {
    // 从请求头获取 API 版本
    const versionFromHeader = req.headers['api-version'] as string
    // 从 URL 参数获取 API 版本
    const versionFromQuery = req.query['v'] as string
    // 从 URL 路径获取 API 版本
    const versionFromPath = this.extractVersionFromPath(req.path)

    // 确定使用的版本优先级：路径 > 查询参数 > 请求头 > 默认版本
    const version = versionFromPath || versionFromQuery || versionFromHeader || ApiVersion.V1

    // 将版本信息添加到请求对象
    req.apiVersion = version
    req.apiVersionSource = versionFromPath
      ? 'path'
      : versionFromQuery
        ? 'query'
        : versionFromHeader
          ? 'header'
          : 'default'

    this.logger.debug(`API version: ${version} (source: ${req.apiVersionSource})`)

    // 添加版本响应头
    res.setHeader('API-Version', version)

    next()
  }

  private extractVersionFromPath(path: string): string | null {
    // 匹配 /api/v1/users 或 /v1/users 格式
    const pathMatch = path.match(/^\/(?:api\/)?v(\d+)(?:\/|$)/)
    return pathMatch ? `v${pathMatch[1]}` : null
  }
}
