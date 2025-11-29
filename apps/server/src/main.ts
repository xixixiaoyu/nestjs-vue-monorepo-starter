import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import 'dotenv/config'
import { ValidationPipe, Logger } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { BusinessExceptionFilter } from './common/filters/business-exception.filter'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NodeEnvironment } from './config/environment'
import type { Request, Response, NextFunction } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 配置更严格的 CORS 策略
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
      const configService = app.get(ConfigService)
      const environment =
        configService.get<NodeEnvironment>('NODE_ENV') ?? NodeEnvironment.Development

      // 允许的域名列表
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080',
      ]

      // 生产环境下应该有更严格的域名控制
      if (environment === NodeEnvironment.Production) {
        const productionOrigins = configService.get<string[]>('CORS_ORIGINS') || []
        allowedOrigins.push(...productionOrigins)
      }

      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalFilters(new HttpExceptionFilter(), new BusinessExceptionFilter())

  const configService = app.get(ConfigService)
  const environment = configService.get<NodeEnvironment>('NODE_ENV') ?? NodeEnvironment.Development

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest + Vue Template API')
    .setDescription('API reference generated from decorators')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  // 添加安全头
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  const port = configService.get<number>('PORT') ?? 3001
  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`Server started on port ${port} in ${environment} mode`)
  logger.log(`Swagger documentation available at http://localhost:${port}/docs`)
}

bootstrap()
