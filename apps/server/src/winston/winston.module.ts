import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import { createWinstonLogger } from './winston.config'

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: createWinstonLogger,
      inject: [ConfigService],
    }),
  ],
  exports: [WinstonModule],
})
export class CustomWinstonModule {}
