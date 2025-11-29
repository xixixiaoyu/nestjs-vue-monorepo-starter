import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Public } from './decorators/public.decorator'
import { GetUser } from './decorators/get-user.decorator'
import { ConfigService } from '@nestjs/config'
import type { LoginInput, RegisterInput, AuthResponse, JwtPayload } from '@shared-types'

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginInput: LoginInput,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.login(loginInput)

    // 设置 httpOnly Cookie 存储刷新令牌
    response.cookie('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 天
      path: '/',
    })

    // 返回访问令牌（可以存储在内存中）
    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken, // 保留兼容性
      user: authResponse.user,
    }
  }

  @Public()
  @Post('register')
  async register(
    @Body() registerInput: RegisterInput,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.register(registerInput)

    // 设置 httpOnly Cookie 存储刷新令牌
    response.cookie('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 天
      path: '/',
    })

    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken, // 保留兼容性
      user: authResponse.user,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  async refresh(
    @Req() request: Request,
    @Body('refreshToken') refreshToken?: string
  ): Promise<{ accessToken: string }> {
    // 优先从 Cookie 获取刷新令牌，其次从请求体
    const tokenFromCookie = request.cookies?.refreshToken
    const tokenToUse = refreshToken || tokenFromCookie

    if (!tokenToUse) {
      throw new UnauthorizedException('刷新令牌缺失')
    }

    return this.authService.refreshAccessToken(tokenToUse)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body('refreshToken') refreshToken?: string
  ): Promise<void> {
    // 优先从 Cookie 获取刷新令牌，其次从请求体
    const tokenFromCookie = request.cookies?.refreshToken
    const tokenToUse = refreshToken || tokenFromCookie

    // 获取访问令牌用于加入黑名单
    const accessToken = request.headers.authorization?.replace('Bearer ', '')

    if (tokenToUse) {
      await this.authService.logout(tokenToUse, accessToken)
    }

    // 清除 Cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    })
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: JwtPayload) {
    return user
  }
}
