import { Request, Response, NextFunction } from 'express';
import { checkSystemHealth } from '../services/health.service';

export const getHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const health = await checkSystemHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health,
    });
  } catch (err) {
    next(err);
  }
};
