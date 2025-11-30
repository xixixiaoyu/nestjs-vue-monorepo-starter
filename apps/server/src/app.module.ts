import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { validateEnvironment } from './config/environment'
// import { EmailModule } from './email/email.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
      envFilePath: '.env',
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
    // Winston 日志模块
    // CustomWinstonModule,
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
