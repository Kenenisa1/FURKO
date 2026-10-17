import { Router } from 'express';
import { EvidenceController } from '../controllers/evidence.controller';
import { uploadEvidence } from '../middleware/upload.middleware';
import { verifyToken } from '../middleware/authMiddleware';
import { ReportController } from '../controllers/report.controller';
import { reportController } from '../controllers/reportController';

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

// Create a report
router.post('/', verifyToken, ReportController.create);

// Get reports belonging to the logged-in citizen
router.get('/', verifyToken, reportController.getMyReports);

export default router;