import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { InstitutionWorkflowController } from '../controllers/institutionWorkflow.controller';

const router = Router();

// Public list of active institutions (for routing and dropdowns)
router.get('/list', InstitutionWorkflowController.listInstitutions);

// Institution profile
router.get('/profile', verifyToken, InstitutionWorkflowController.getProfile);
router.put('/profile', verifyToken, InstitutionWorkflowController.updateProfile);

// Staff management
router.get('/staff', verifyToken, InstitutionWorkflowController.getStaff);
router.post('/staff', verifyToken, InstitutionWorkflowController.createStaff);
router.put('/staff/:id', verifyToken, InstitutionWorkflowController.updateStaff);
router.delete('/staff/:id', verifyToken, InstitutionWorkflowController.deleteStaff);

// Report workflow
router.get('/reports', verifyToken, InstitutionWorkflowController.getInbox);
router.get('/reports/:id', verifyToken, InstitutionWorkflowController.reviewReport);
router.post('/reports/:id/action', verifyToken, InstitutionWorkflowController.changeReportStatus);
router.post('/reports/:id/assign', verifyToken, InstitutionWorkflowController.assignStaff);
router.get('/reports/:id/history', verifyToken, InstitutionWorkflowController.getHistory);

export default router;