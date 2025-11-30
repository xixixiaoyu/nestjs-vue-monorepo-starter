import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ClsModule } from 'nestjs-cls'
import { ErrorTrackingService } from './services/error-tracking.service'
import { EnhancedLoggingService } from './services/enhanced-logging.service'
import { EnhancedExceptionFilter } from './filters/enhanced-exception.filter'

@Module({
  imports: [ConfigModule, ClsModule],
  providers: [ErrorTrackingService, EnhancedLoggingService, EnhancedExceptionFilter],
  exports: [ErrorTrackingService, EnhancedLoggingService, EnhancedExceptionFilter],
})
export class EnhancedCommonModule {}
