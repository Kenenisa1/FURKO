import { Router } from 'express';
import healthRoutes from './health.routes';
import evidenceRoutes from './evidence.routes';
import reportRoutes from './report.routes';
import routingRoutes from './routing.routes';
import institutionWorkflowRoutes from './institutionWorkflow.routes';

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
      evidenceUpload: '/api/v1/evidence/upload',
      reportEvidence: '/api/v1/reports/:id/evidence',
      routingPreview: '/api/v1/routing/preview',
      institutions: '/api/v1/institutions',
    },
  });
});

// Health check endpoint under /api/v1/health
router.use('/health', healthRoutes);

// Evidence upload and management routes
router.use('/evidence', evidenceRoutes);

// Report routes (including evidence endpoints)
router.use('/reports', reportRoutes);

// Institution workflow routes
router.use('/institutions', institutionWorkflowRoutes);

// Rule-based routing engine routes
router.use('/routing', routingRoutes);

export default router;
