import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { TokenBlacklistService } from '../token-blacklist.service'
import type { JwtPayload } from '@shared-types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(TokenBlacklistService) private tokenBlacklistService: TokenBlacklistService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
      passReqToCallback: true,
    })
  }

  async validate(req: any, payload: JwtPayload): Promise<JwtPayload> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)

    if (!token) {
      throw new UnauthorizedException('令牌缺失')
    }

    // 检查令牌是否在黑名单中
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token)
    if (isBlacklisted) {
      throw new UnauthorizedException('令牌已失效')
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
