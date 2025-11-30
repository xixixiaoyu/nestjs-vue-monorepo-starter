import { Controller, Get, Res, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { register } from 'prom-client'
import { MetricsService } from './metrics.service'

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: '获取 Prometheus 指标' })
  @ApiResponse({
    status: 200,
    description: 'Prometheus 格式的指标数据',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example:
            '# HELP http_requests_total Total number of HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",route="/health",status_code="200"} 42\n',
        },
      },
    },
  })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics()

    res.set({
      'Content-Type': register.contentType,
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    res.status(HttpStatus.OK).send(metrics)
  }
}
