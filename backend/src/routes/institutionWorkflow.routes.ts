import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import { InstitutionWorkflowController } from '../controllers/institutionWorkflow.controller';

const router = Router();

// Public list of active institutions (for routing, public directory and dropdowns)
router.get('/list', InstitutionWorkflowController.listInstitutions);

// Institution profile
router.get('/profile', verifyToken, requirePermission('institutions.view'), InstitutionWorkflowController.getProfile);
router.put('/profile', verifyToken, requirePermission('institutions.manage'), InstitutionWorkflowController.updateProfile);

// Staff management
router.get('/staff', verifyToken, requirePermission('staff.view'), InstitutionWorkflowController.getStaff);
router.post('/staff', verifyToken, requirePermission('staff.create'), InstitutionWorkflowController.createStaff);
router.put('/staff/:id', verifyToken, requirePermission('staff.update'), InstitutionWorkflowController.updateStaff);
router.delete('/staff/:id', verifyToken, requirePermission('staff.deactivate'), InstitutionWorkflowController.deleteStaff);

// Branch management
router.get('/branches', verifyToken, requirePermission('branches.view'), InstitutionWorkflowController.getBranches);
router.post('/branches', verifyToken, requirePermission('branches.manage'), InstitutionWorkflowController.createBranch);

// Report workflow & assignments
router.get('/reports', verifyToken, InstitutionWorkflowController.getInbox);
router.get('/reports/:id', verifyToken, InstitutionWorkflowController.reviewReport);
router.post('/reports/:id/action', verifyToken, InstitutionWorkflowController.changeReportStatus);
router.post('/reports/:id/assign', verifyToken, requirePermission('reports.assign_staff'), InstitutionWorkflowController.assignStaff);
router.get('/reports/:id/history', verifyToken, InstitutionWorkflowController.getHistory);

// Two-stage completion review
router.post('/reports/:id/submit-completion', verifyToken, requirePermission('reports.submit_completion'), InstitutionWorkflowController.submitWorkForReview);
router.post('/reports/:id/review-completion', verifyToken, requirePermission('reports.review_completion'), InstitutionWorkflowController.reviewCompletion);

// Branch transfers
router.post('/reports/:id/transfer-branch', verifyToken, requirePermission('reports.transfer_branch'), InstitutionWorkflowController.initiateBranchTransfer);
router.get('/transfers', verifyToken, requirePermission('reports.transfer_branch'), InstitutionWorkflowController.getTransfers);
router.post('/transfers/:transferId/review', verifyToken, requirePermission('reports.transfer_branch'), InstitutionWorkflowController.reviewBranchTransfer);

// Audit logs
router.get('/audit', verifyToken, requirePermission('reports.view_audit'), InstitutionWorkflowController.getAuditLogs);

export default router;