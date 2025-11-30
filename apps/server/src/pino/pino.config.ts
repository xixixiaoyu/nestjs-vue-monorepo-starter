import { ConfigService } from '@nestjs/config'
import { NodeEnvironment } from '../config/environment'
import { ClsService } from 'nestjs-cls'

export const createPinoLogger = (configService: ConfigService, cls?: ClsService) => {
  const environment = configService.get<NodeEnvironment>('NODE_ENV') ?? NodeEnvironment.Development
  const isProduction = environment === NodeEnvironment.Production
  const logLevel = configService.get<string>('LOG_LEVEL') ?? 'info'

  return {
    pinoHttp: {
      level: logLevel,
      // 开发环境使用 pino-pretty 美化输出
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss Z',
              ignore: 'pid,hostname',
              messageFormat: '{context} [{level}] {msg}',
            },
          },
      // 生产环境输出标准 JSON
      ...(isProduction && {
        serializers: {
          req: (req: any) => ({
            method: req.method,
            url: req.url,
            headers: {
              'user-agent': req.headers['user-agent'],
              'content-type': req.headers['content-type'],
            },
            remoteAddress: req.remoteAddress,
            remotePort: req.remotePort,
          }),
          res: (res: any) => ({
            statusCode: res.statusCode,
            headers: res.headers,
          }),
        },
      }),
      // 自定义日志格式
      formatters: {
        level: (label: any) => ({ level: label }),
        log: (object: any) => {
          // 添加时间戳和上下文信息
          const logObject = {
            ...object,
            timestamp: new Date().toISOString(),
            // 如果没有 context，使用默认值
            context: object.context || 'Application',
          }

          // 从 CLS 中获取 requestId 并添加到日志中
          if (cls) {
            const requestId = cls.get('requestId')
            if (requestId && !logObject.req?.id) {
              logObject.requestId = requestId
            }
          }

          return logObject
        },
      },
      // 自定义请求 ID - 优先从 CLS 中获取，确保日志里的 req.id 和 CLS 里的 ID 一致
      genReqId: (req: any) => {
        // 尝试从 CLS 中获取 requestId
        if (cls) {
          const clsRequestId = cls.get('requestId')
          if (clsRequestId) {
            return clsRequestId
          }
        }
        // 回退到从请求头获取或生成新的
        return (req.headers['x-request-id'] as string) || generateRequestId()
      },
      // 自定义错误处理
      customErrorHandling: (err: any, req: any, _res: any) => {
        // 记录错误堆栈
        req.log.error(
          {
            err: {
              message: err.message,
              stack: err.stack,
              name: err.name,
            },
            req: {
              method: req.method,
              url: req.url,
              headers: req.headers,
              query: req.query,
              params: req.params,
            },
          },
          'Request error'
        )
      },
    },
    // 排除某些路径的日志记录
    exclude: ['/health', '/metrics'],
  }
}

// 生成简单的请求 ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
