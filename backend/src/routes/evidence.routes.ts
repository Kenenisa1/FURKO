import { Router } from 'express';
import { EvidenceController } from '../controllers/evidence.controller';
import { uploadEvidence } from '../middleware/upload.middleware';

const router = Router();

// Support both 'file' and 'evidence' field names for flexible client compatibility
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
 * @route   POST /api/v1/evidence/upload
 * @desc    Upload evidence photo file and optionally link with report
 * @access  Public / Authenticated
 */
router.post('/upload', handleSingleUpload, normalizeFileField, EvidenceController.upload);

/**
 * @route   POST /api/v1/evidence
 * @desc    Alias for upload
 */
router.post('/', handleSingleUpload, normalizeFileField, EvidenceController.upload);

export default router;
