import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

type RequestWithCorrelationId = Request & { correlationId?: string };

@Controller('v1/health')
export class HealthController {
  @Get()
  getHealth(@Req() req: RequestWithCorrelationId) {
    return {
      status: 'ok',
      traceId: req.correlationId ?? null,
    };
  }
}
