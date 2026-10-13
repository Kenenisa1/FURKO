import { Router } from 'express';
import { EvidenceController } from '../controllers/evidence.controller';
import { uploadEvidence } from '../middleware/upload.middleware';
import { verifyToken } from '../middleware/authMiddleware';
import { ReportController } from '../controllers/report.controller';
import { reportController } from '../controllers/reportController';
import { ReportResolutionController } from '../controllers/reportResolution.controller';

const router = Router();

const handleSingleUpload = uploadEvidence.fields([
  { name: 'file', maxCount: 1 },
  { name: 'evidence', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

const normalizeFileField = (req: any, _res: any, next: any) => {
  if (req.files) {
    if (req.files.file?.[0]) {
      req.file = req.files.file[0];
    } else if (req.files.evidence?.[0]) {
      req.file = req.files.evidence[0];
    } else if (req.files.photo?.[0]) {
      req.file = req.files.photo[0];
    }
  }
  next();
};

// Public or authenticated tracking by tracking number
router.get('/track/:trackingNumber', ReportResolutionController.getTimeline);

// Upload evidence for a report
router.post(
  '/:id/evidence',
  verifyToken,
  handleSingleUpload,
  normalizeFileField,
  EvidenceController.uploadForReport
);

// Get evidence attached to a report
router.get(
  '/:id/evidence',
  verifyToken,
  EvidenceController.getReportEvidence
);

// Report status timeline & resolution details
router.get('/:id/timeline', ReportResolutionController.getTimeline);
router.get('/:id', ReportResolutionController.getTimeline);

// Citizen confirm resolution
router.post('/:id/confirm', verifyToken, ReportResolutionController.confirm);

// Citizen reopen report
router.post('/:id/reopen', verifyToken, ReportResolutionController.reopen);
router.patch('/:id/reopen', verifyToken, ReportResolutionController.reopen);

// Create a report
router.post('/', verifyToken, ReportController.create);

// Get reports belonging to the logged-in citizen
router.get('/', verifyToken, reportController.getMyReports);

export default router;