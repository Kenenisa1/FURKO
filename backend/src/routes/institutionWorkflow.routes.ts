import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { InstitutionWorkflowController } from '../controllers/institutionWorkflow.controller';

const router = Router();

router.get('/reports', verifyToken, InstitutionWorkflowController.getInbox);

router.get('/reports/:id', verifyToken, InstitutionWorkflowController.reviewReport);

router.post('/reports/:id/action', verifyToken, InstitutionWorkflowController.changeReportStatus);

router.post('/reports/:id/assign', verifyToken, InstitutionWorkflowController.assignStaff);

router.get('/reports/:id/history', verifyToken, InstitutionWorkflowController.getHistory);

export default router;