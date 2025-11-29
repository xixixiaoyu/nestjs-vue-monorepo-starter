import { ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { NodeEnvironment } from '../config/environment'

export const createWinstonLogger = (configService: ConfigService) => {
  const environment = configService.get<NodeEnvironment>('NODE_ENV') ?? NodeEnvironment.Development
  const isProduction = environment === NodeEnvironment.Production

  // 定义日志格式
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )

  // 控制台格式（开发环境使用，带颜色）
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      const traceStr = trace ? `\n${trace}` : ''
      return `${timestamp} [${context || 'Application'}] ${level}: ${message}${metaStr}${traceStr}`
    })
  )

  // 传输器配置
  const transports: winston.transport[] = []

  if (isProduction) {
    // 生产环境：使用文件日志
    transports.push(
      // 错误日志
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
      }),
      // 所有日志
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
      })
    )
  } else {
    // 开发环境：使用控制台输出
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
      })
    )
  }

  return {
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? logFormat : consoleFormat,
    transports,
    // 处理未捕获的异常
    exceptionHandlers: isProduction
      ? [
          new DailyRotateFile({
            filename: 'logs/exceptions-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
          }),
        ]
      : [new winston.transports.Console({ format: consoleFormat })],
    // 处理未处理的 Promise 拒绝
    rejectionHandlers: isProduction
      ? [
          new DailyRotateFile({
            filename: 'logs/rejections-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
          }),
        ]
      : [new winston.transports.Console({ format: consoleFormat })],
  }
}
