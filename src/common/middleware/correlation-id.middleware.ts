import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

type RequestWithCorrelationId = Request & { correlationId?: string };

export function correlationIdMiddleware(
  req: RequestWithCorrelationId,
  res: Response,
  next: NextFunction,
): void {
  const incoming = req.header('x-correlation-id');
  const correlationId = incoming ?? randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
