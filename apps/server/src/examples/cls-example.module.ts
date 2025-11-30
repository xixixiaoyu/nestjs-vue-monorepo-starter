import { Module } from '@nestjs/common'
import { ClsExampleController } from './cls-example.controller'
import { ClsExampleService } from './cls-example.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ClsExampleController],
  providers: [ClsExampleService],
})
export class ClsExampleModule {}
