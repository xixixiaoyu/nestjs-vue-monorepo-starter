// 后端专用的 DTO 类，使用 nestjs-zod 的 createZodDto
// 前端不应该导入这个文件，只需要使用 types/ 中的纯类型

import { createZodDto } from 'nestjs-zod'
import {
  CreateUserSchema,
  UserSchema,
  LoginSchema,
  RegisterSchema,
  AuthResponseSchema,
  JwtPayloadSchema,
  SendWelcomeEmailSchema,
  HealthSchema,
  ApiHealthSchema,
  PaginationParamsSchema,
} from '../schemas'

// 用户相关 DTO（后端专用，带 Request/Response 后缀以区分类型）
export class CreateUserRequestDto extends createZodDto(CreateUserSchema) {}
export class UserResponseDto extends createZodDto(UserSchema) {}

// 认证相关 DTO
export class LoginRequestDto extends createZodDto(LoginSchema) {}
export class RegisterRequestDto extends createZodDto(RegisterSchema) {}
export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
export class JwtPayloadDto extends createZodDto(JwtPayloadSchema) {}

// 邮件相关 DTO
export class SendWelcomeEmailRequestDto extends createZodDto(SendWelcomeEmailSchema) {}

// 健康检查 DTO
export class HealthResponseDto extends createZodDto(HealthSchema) {}
export class ApiHealthResponseDto extends createZodDto(ApiHealthSchema) {}

// 分页 DTO
export class PaginationParamsRequestDto extends createZodDto(PaginationParamsSchema) {}
