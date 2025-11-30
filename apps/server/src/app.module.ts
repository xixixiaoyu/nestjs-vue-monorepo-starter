import { Module } from '@nestjs/common'
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
import { UsersModule } from './users/users.module'

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
      middleware: { mount: true }, // 自动挂载
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
    UsersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // 移除手动中间件配置，让 nestjs-cls 自动处理
}
