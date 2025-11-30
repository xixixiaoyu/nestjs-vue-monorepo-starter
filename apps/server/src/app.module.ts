import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { validateEnvironment } from './config/environment'
import { createPinoLogger } from './pino/pino.config'
// import { EmailModule } from './email/email.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
      envFilePath: '.env',
    }),
    // Pino 日志模块
    LoggerModule.forRootAsync({
      useFactory: createPinoLogger,
      inject: [ConfigService],
    }),
    // BullMQ 全局配置，使用现有的 Redis 连接
    // BullModule.forRootAsync({
    //   useFactory: () =>
    //     ({
    //       connection: {
    //         host: process.env.REDIS_HOST || 'localhost',
    //         port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //         password: process.env.REDIS_PASSWORD || undefined,
    //       },
    //     }) as any,
    // }),
    PrismaModule,
    // RedisModule,
    // CacheModule,
    // AuthModule,
    // UsersModule,
    // EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
