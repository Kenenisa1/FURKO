
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { reportController } from '../controllers/reportController';

const router = Router();

// GET /api/v1/reports
router.get('/', verifyToken, reportController.getMyReports);

export default router;
