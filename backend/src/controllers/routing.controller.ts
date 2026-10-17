import { Request, Response, NextFunction } from 'express';
import { RoutingService } from '../services/routing';

export class RoutingController {
  /**
   * Preview or compute routing for a problem report
   * POST /api/v1/routing/preview
   */
  static async previewRouting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category_id, latitude, longitude, address_text } = req.body;

      if (!category_id) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Field "category_id" is required for routing determination.',
            statusCode: 400,
          },
        });
        return;
      }

      const parsedLat = latitude !== undefined && latitude !== null ? parseFloat(latitude) : undefined;
      const parsedLng = longitude !== undefined && longitude !== null ? parseFloat(longitude) : undefined;

      const decision = await RoutingService.determineRouting({
        category_id,
        latitude: parsedLat,
        longitude: parsedLng,
        address_text,
      });

      res.status(200).json({
        success: true,
        data: decision,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List pilot institutions configured in the routing system
   * GET /api/v1/routing/institutions
   */
  static async getInstitutions(_req: Request, res: Response): Promise<void> {
    const { DEFAULT_PILOT_INSTITUTIONS } = await import('../services/routing/routing.constants');
    res.status(200).json({
      success: true,
      data: DEFAULT_PILOT_INSTITUTIONS,
    });
  }

  /**
   * List configured categories
   * GET /api/v1/routing/categories
   */
  static async getCategories(_req: Request, res: Response): Promise<void> {
    const { DEFAULT_PILOT_CATEGORIES } = await import('../services/routing/routing.constants');
    res.status(200).json({
      success: true,
      data: DEFAULT_PILOT_CATEGORIES,
    });
  }
}
