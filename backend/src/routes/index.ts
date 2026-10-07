import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// API Root info
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'FURKO CivicTech API v1 - Jimma City Pilot',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      health: '/api/v1/health',
    },
  });
});

// Health check endpoint under /api/v1/health
router.use('/health', healthRoutes);

export default router;
