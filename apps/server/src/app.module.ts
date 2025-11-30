import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { ClsModule, ClsService } from 'nestjs-cls'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { validateEnvironment } from './config/environment'
import { createPinoLogger } from './pino/pino.config'
import { EmailModule } from './email/email.module'
import { ClsMiddleware } from './common/cls/cls.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
      envFilePath: '.env',
    }),
    // CLS 模块 - 全局注册，为每个请求创建上下文
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    // Pino 日志模块
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService, cls: ClsService) =>
        createPinoLogger(configService, cls),
      inject: [ConfigService, ClsService],
    }),
    PrismaModule,
    RedisModule,
    // CacheModule,
    // AuthModule,
    // UsersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*')
  }
}
