import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { validateEnvironment } from './config/environment'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CacheModule } from './cache/cache.module'
import { RedisModule } from './redis/redis.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    CacheModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
