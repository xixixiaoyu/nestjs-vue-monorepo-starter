import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import bcrypt from 'bcryptjs'
import type { LoginInput, RegisterInput, AuthResponse, JwtPayload, UserDto } from '@shared-types'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.password || !user.isActive) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password)
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: 'user', // 这里应该从数据库获取实际角色
    }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = await this.generateRefreshToken(user.id)

    return {
      accessToken,
      refreshToken,
      user,
    }
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerInput.email },
    })

    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册')
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10)

    const user = await this.prisma.user.create({
      data: {
        email: registerInput.email,
        name: registerInput.name,
        password: hashedPassword,
        role: 'user',
      },
    })

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = await this.generateRefreshToken(user.id)

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    return {
      accessToken,
      refreshToken,
      user: userDto,
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('无效的刷新令牌')
    }

    const payload: JwtPayload = {
      sub: token.user.id,
      email: token.user.email,
      role: token.user.role,
    }

    const accessToken = this.generateAccessToken(payload)

    return { accessToken }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    })
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload)
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = this.generateRandomToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 天后过期

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })

    return token
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}
