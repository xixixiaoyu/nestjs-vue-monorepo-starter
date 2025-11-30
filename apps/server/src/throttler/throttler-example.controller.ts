import { Controller, Get } from '@nestjs/common'
import { Throttle, SkipThrottle } from '@nestjs/throttler'

@Controller('throttler-example')
export class ThrottlerExampleController {
  // 使用默认限流规则（60秒内100次请求）
  @Get()
  getDefaultThrottled() {
    return {
      message: '此接口使用默认限流规则（60秒内100次请求）',
      timestamp: new Date().toISOString(),
    }
  }

  // 跳过限流
  @SkipThrottle()
  @Get('skip-throttle')
  getSkipThrottle() {
    return {
      message: '此接口跳过限流，无请求限制',
      timestamp: new Date().toISOString(),
    }
  }

  // 自定义限流规则（60秒内1000次请求）
  @Throttle({ default: { limit: 1000, ttl: 60000 } })
  @Get('custom-throttle')
  getCustomThrottle() {
    return {
      message: '此接口使用自定义限流规则（60秒内1000次请求）',
      timestamp: new Date().toISOString(),
    }
  }

  // 更严格的限流规则（60秒内5次请求）
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('strict-throttle')
  getStrictThrottle() {
    return {
      message: '此接口使用严格限流规则（60秒内5次请求）',
      timestamp: new Date().toISOString(),
    }
  }

  // 多个限流规则示例
  @Throttle({
    default: { limit: 20, ttl: 60000 }, // 每分钟20次
    short: { limit: 5, ttl: 10000 }, // 每10秒5次
  })
  @Get('multiple-throttles')
  getMultipleThrottles() {
    return {
      message: '此接口使用多个限流规则（每分钟20次，每10秒5次）',
      timestamp: new Date().toISOString(),
    }
  }
}
