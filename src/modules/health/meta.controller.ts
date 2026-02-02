import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

type RequestWithCorrelationId = Request & { correlationId?: string };

function getAppVersion(): string {
  return process.env.npm_package_version ?? '0.0.0';
}

@Controller('v1')
export class MetaController {
  @Get('version')
  getVersion(@Req() req: RequestWithCorrelationId) {
    return {
      version: getAppVersion(),
      traceId: req.correlationId ?? null,
    };
  }

  @Get('status')
  getStatus(@Req() req: RequestWithCorrelationId) {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      traceId: req.correlationId ?? null,
    };
  }
}
