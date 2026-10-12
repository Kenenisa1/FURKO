import { Router } from 'express';
import { EvidenceController } from '../controllers/evidence.controller';
import { uploadEvidence } from '../middleware/upload.middleware';

const router = Router();

const handleSingleUpload = uploadEvidence.fields([
  { name: 'file', maxCount: 1 },
  { name: 'evidence', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

const normalizeFileField = (req: any, _res: any, next: any) => {
  if (req.files) {
    if (req.files.file && req.files.file[0]) {
      req.file = req.files.file[0];
    } else if (req.files.evidence && req.files.evidence[0]) {
      req.file = req.files.evidence[0];
    } else if (req.files.photo && req.files.photo[0]) {
      req.file = req.files.photo[0];
    }
  }
  next();
};

/**
 * @route   POST /api/v1/reports/:id/evidence
 * @desc    Upload evidence associated directly with a report
 */
router.post('/:id/evidence', handleSingleUpload, normalizeFileField, EvidenceController.uploadForReport);

/**
 * @route   GET /api/v1/reports/:id/evidence
 * @desc    Get all evidence attachments for a report
 */
router.get('/:id/evidence', EvidenceController.getReportEvidence);

export default router;
