import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import 'dotenv/config'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NodeEnvironment } from './config/environment'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 启用 cookie parser
  app.use(cookieParser())

  // 配置 CORS 策略
  const configService = app.get(ConfigService)
  const environment = configService.get<NodeEnvironment>('NODE_ENV') ?? NodeEnvironment.Development

  if (environment === NodeEnvironment.Production) {
    // 生产环境：只允许配置的域名
    const allowedOrigins = configService.get<string[]>('CORS_ORIGINS') || []
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    })
  } else {
    // 开发和测试环境：允许所有本地域名
    app.enableCors({
      origin: true,
      credentials: true,
    })
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  // 导入并使用全局异常过滤器
  const { GlobalExceptionFilter } = await import('./common/filters/global-exception.filter')
  const { HttpExceptionFilter } = await import('./common/filters/http-exception.filter')
  const { BusinessExceptionFilter } = await import('./common/filters/business-exception.filter')

  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new HttpExceptionFilter(),
    new BusinessExceptionFilter()
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest + Vue Template API')
    .setDescription('API reference generated from decorators')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  // 使用 helmet 中间件添加安全头，配置更宽松的 CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  )

  const port = configService.get<number>('PORT') ?? 3001
  await app.listen(port)

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER)
  logger.log(`Server started on port ${port} in ${environment} mode`, 'Bootstrap')
  logger.log(`Swagger documentation available at http://localhost:${port}/docs`, 'Bootstrap')
}

bootstrap()
