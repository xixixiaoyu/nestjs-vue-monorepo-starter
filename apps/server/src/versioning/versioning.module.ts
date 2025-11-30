import { Module } from '@nestjs/common'
import { VersioningMiddleware } from './versioning.middleware'
import { VersionedController } from './versioned.controller'

@Module({
  controllers: [VersionedController],
  providers: [VersioningMiddleware],
  exports: [VersioningMiddleware],
})
export class VersioningModule {}
