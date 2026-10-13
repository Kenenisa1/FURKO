import { Router } from 'express';
import { RoutingController } from '../controllers/routing.controller';

const router = Router();

/**
 * @route   POST /api/v1/routing/preview
 * @desc    Determine responsible institution using rule-based routing engine
 * @access  Public / Authenticated
 */
router.post('/preview', RoutingController.previewRouting);

/**
 * @route   GET /api/v1/routing/institutions
 * @desc    Get configured institutions
 */
router.get('/institutions', RoutingController.getInstitutions);

/**
 * @route   GET /api/v1/routing/categories
 * @desc    Get configured problem categories
 */
router.get('/categories', RoutingController.getCategories);

export default router;
