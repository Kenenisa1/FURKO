import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer specific errors (e.g. LIMIT_FILE_SIZE)
  if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = 'File too large. Maximum allowed size is 10MB.';
    } else {
      statusCode = 400;
    }
  }

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
