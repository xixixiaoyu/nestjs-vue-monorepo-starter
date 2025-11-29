import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { Public } from './decorators/public.decorator'
import { GetUser } from './decorators/get-user.decorator'
import type { LoginInput, RegisterInput, AuthResponse, JwtPayload } from '@shared-types'

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput)
  }

  @Public()
  @Post('register')
  async register(@Body() registerInput: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(registerInput)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
    return this.authService.refreshAccessToken(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: JwtPayload) {
    return user
  }
}
