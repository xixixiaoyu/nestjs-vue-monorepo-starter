import { Injectable } from '@nestjs/common'
import type { ApiHealth } from '@types'

@Injectable()
export class AppService {
  getHealth(): ApiHealth {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
