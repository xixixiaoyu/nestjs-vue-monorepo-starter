import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TokenBlacklistService } from './token-blacklist.service'
import { UnauthorizedException, BadRequestException } from '../common/exceptions/business.exception'
import type { LoginInput, RegisterInput } from '@shared-types'

describe('AuthService', () => {
  let authService: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService
  let configService: ConfigService
  let tokenBlacklistService: TokenBlacklistService

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    } as any

    jwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    } as any

    configService = {
      get: vi.fn(),
    } as any

    tokenBlacklistService = {
      addToBlacklist: vi.fn(),
      isBlacklisted: vi.fn(),
    } as any

    authService = new AuthService(prismaService, jwtService, configService, tokenBlacklistService)
  })

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser as any)
      vi.spyOn(authService as any, 'bcryptCompare').mockResolvedValue(true)

      const result = await authService.validateUser('test@example.com', 'password123')

      expect(result).toBeTruthy()
      expect(result?.id).toBe('1')
      expect(result?.email).toBe('test@example.com')
    })

    it('should return null when user does not exist', async () => {
      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null)

      const result = await authService.validateUser('nonexistent@example.com', 'password123')

      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('should return auth response for valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(prismaService.user.findUnique).mockResolvedValue(mockUser as any)
      vi.spyOn(authService as any, 'bcryptCompare').mockResolvedValue(true)
      vi.mocked(jwtService.sign).mockReturnValue('mock-jwt-token')
      vi.mocked(prismaService.refreshToken.create).mockResolvedValue({
        id: 'refresh-token-1',
        token: 'refresh-token-1',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
      } as any)

      const result = await authService.login(loginInput)

      expect(result).toBeTruthy()
      expect(result?.accessToken).toBe('mock-jwt-token')
      expect(result?.user?.id).toBe('1')
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null)

      await expect(authService.login(loginInput)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('register', () => {
    it('should create new user and return auth response', async () => {
      const registerInput: RegisterInput = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const mockUser = {
        id: '2',
        email: 'newuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prismaService.user.findUnique).mockResolvedValue(null)
      vi.spyOn(authService as any, 'bcryptHash').mockResolvedValue('hashed-password')
      vi.mocked(prismaService.user.create).mockResolvedValue(mockUser as any)
      vi.mocked(jwtService.sign).mockReturnValue('mock-jwt-token')
      vi.mocked(prismaService.refreshToken.create).mockResolvedValue({
        id: 'refresh-token-2',
        token: 'refresh-token-2',
        userId: '2',
        expiresAt: new Date(),
        createdAt: new Date(),
      } as any)

      const result = await authService.register(registerInput)

      expect(result).toBeTruthy()
      expect(result?.accessToken).toBe('mock-jwt-token')
      expect(result?.user?.id).toBe('2')
    })

    it('should throw BadRequestException when email already exists', async () => {
      const registerInput: RegisterInput = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }

      vi.mocked(prismaService.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      } as any)

      await expect(authService.register(registerInput)).rejects.toThrow(BadRequestException)
    })
  })
})
