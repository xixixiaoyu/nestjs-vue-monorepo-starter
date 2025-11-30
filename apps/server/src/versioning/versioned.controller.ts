import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger'
import { ApiVersion } from './api-version.enum'

@ApiTags('Versioned API')
@Controller()
export class VersionedController {
  @Get('users')
  @ApiOperation({ summary: '获取用户列表 (V1)' })
  @ApiResponse({ status: 200, description: '用户列表' })
  getUsersV1(@Headers('api-version') version: string) {
    return {
      version: version || ApiVersion.V1,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ],
      timestamp: new Date().toISOString(),
    }
  }

  @Get('v2/users')
  @ApiOperation({ summary: '获取用户列表 (V2)' })
  @ApiResponse({ status: 200, description: '用户列表 (V2 格式)' })
  getUsersV2() {
    return {
      version: ApiVersion.V2,
      data: [
        {
          id: 1,
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
          },
          contact: {
            email: 'john@example.com',
            phone: '+1234567890',
          },
          metadata: {
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-12-01T10:30:00Z',
          },
        },
        {
          id: 2,
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            fullName: 'Jane Smith',
          },
          contact: {
            email: 'jane@example.com',
            phone: '+0987654321',
          },
          metadata: {
            createdAt: '2023-02-01T00:00:00Z',
            lastLogin: '2023-12-02T15:45:00Z',
          },
        },
      ],
      timestamp: new Date().toISOString(),
    }
  }

  @Get('users/:id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiResponse({ status: 200, description: '用户详情' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  getUserById(@Param('id') id: string, @Headers('api-version') version: string) {
    const apiVersion = version || ApiVersion.V1

    if (apiVersion === ApiVersion.V2) {
      // V2 格式返回更详细的信息
      return {
        version: ApiVersion.V2,
        data: {
          id: parseInt(id),
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            avatar: 'https://example.com/avatars/john.jpg',
          },
          contact: {
            email: 'john@example.com',
            phone: '+1234567890',
            address: {
              street: '123 Main St',
              city: 'New York',
              country: 'USA',
            },
          },
          metadata: {
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-12-01T10:30:00Z',
            loginCount: 42,
          },
        },
        timestamp: new Date().toISOString(),
      }
    } else {
      // V1 格式返回基本信息
      return {
        version: ApiVersion.V1,
        data: {
          id: parseInt(id),
          name: 'John Doe',
          email: 'john@example.com',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  @Post('users')
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  createUser(@Body() userData: any, @Headers('api-version') version: string) {
    const apiVersion = version || ApiVersion.V1

    if (apiVersion === ApiVersion.V2) {
      // V2 需要更完整的用户信息
      return {
        version: ApiVersion.V2,
        message: 'User created successfully with V2 format',
        data: {
          id: Date.now(),
          ...userData,
          metadata: {
            createdAt: new Date().toISOString(),
            status: 'active',
          },
        },
        timestamp: new Date().toISOString(),
      }
    } else {
      // V1 只需要基本信息
      return {
        version: ApiVersion.V1,
        message: 'User created successfully',
        data: {
          id: Date.now(),
          name: userData.name || userData.profile?.fullName || 'Unknown',
          email: userData.email || userData.contact?.email || 'unknown@example.com',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  @Get('version-info')
  @ApiOperation({ summary: '获取 API 版本信息' })
  @ApiResponse({ status: 200, description: 'API 版本信息' })
  getVersionInfo() {
    return {
      currentVersion: ApiVersion.V2,
      supportedVersions: [ApiVersion.V1, ApiVersion.V2],
      deprecatedVersions: [],
      defaultVersion: ApiVersion.V1,
      versioningMethods: {
        path: '/api/v1/users, /api/v2/users',
        query: '?v=v1, ?v=v2',
        header: 'api-version: v1, api-version: v2',
      },
      features: {
        v1: ['Basic CRUD operations', 'Simple user model'],
        v2: ['Enhanced user model', 'Detailed metadata', 'Contact information', 'Address support'],
      },
      timestamp: new Date().toISOString(),
    }
  }
}
