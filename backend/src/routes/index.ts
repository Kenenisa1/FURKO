
import { Router } from 'express';
import healthRoutes from './health.routes';
import evidenceRoutes from './evidence.routes';
import reportRoutes from './report.routes';
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
    },
  });
});

router.use('/health', healthRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/reports', reportRoutes);
router.use('/institutions', institutionWorkflowRoutes);

export default router;
