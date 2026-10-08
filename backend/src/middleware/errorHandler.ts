import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProd = env.nodeEnv === 'production';

  console.error(`[Error] ${statusCode} - ${err.message}`);
  if (err.stack && !isProd) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
      ...(err.errors ? { details: err.errors } : {}),
      ...(!isProd && err.stack ? { stack: err.stack } : {}),
    },
  });
};
