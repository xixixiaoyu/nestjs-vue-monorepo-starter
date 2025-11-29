import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { JwtPayload } from '@shared-types'

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
