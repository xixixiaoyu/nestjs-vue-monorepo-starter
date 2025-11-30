import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { ClsModule, ClsService } from 'nestjs-cls'
import { ThrottlerGuard } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { validateEnvironment } from './config/environment'
import { createPinoLogger } from './pino/pino.config'
import { EmailModule } from './email/email.module'
import { ClsMiddleware } from './common/cls/cls.middleware'
import { ClsExampleModule } from './examples/cls-example.module'
import { CustomThrottlerModule } from './throttler/throttler.module'

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
    CustomThrottlerModule,
    // CacheModule,
    // AuthModule,
    // UsersModule,
    EmailModule,
    ClsExampleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*')
  }
}
