import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ClsService } from 'nestjs-cls'
import { randomUUID } from 'crypto'

@Injectable()
export class ClsMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 为每个请求生成唯一的 requestId 并存储到 CLS 中
    const requestId = (req.headers['x-request-id'] as string) || randomUUID()
    this.cls.set('requestId', requestId)

    // 将 requestId 添加到响应头中，便于前端追踪
    res.setHeader('x-request-id', requestId)

    next()
  }
}
