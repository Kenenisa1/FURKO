import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ReportResolutionService } from '../services/reportResolution.service';

export class ReportResolutionController {
  /**
   * Get report resolution timeline, history, evidence, and resolution info
   * GET /api/v1/reports/:id/timeline or GET /api/v1/reports/track/:trackingNumber
   */
  static async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.params.id || req.params.trackingNumber;

      if (!identifier) {
        res.status(400).json({
          success: false,
          error: { message: 'Report ID or tracking number is required.', statusCode: 400 },
        });
        return;
      }

      const details = await ReportResolutionService.getReportTimeline(
        identifier,
        req.user?.userId
      );

      if (!details) {
        res.status(404).json({
          success: false,
          error: { message: `Report "${identifier}" not found.`, statusCode: 404 },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Citizen confirms resolution of a report
   * POST /api/v1/reports/:id/confirm
   */
  static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const citizenId = req.user?.userId;

      if (!citizenId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required to confirm resolution.', statusCode: 401 },
        });
        return;
      }

      const { rating, comment } = req.body;

      if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        res.status(400).json({
          success: false,
          error: { message: 'Rating must be an integer between 1 and 5.', statusCode: 400 },
        });
        return;
      }

      const result = await ReportResolutionService.confirmResolution(id, {
        citizen_id: citizenId,
        rating,
        comment,
      });

      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: { message: error.message, statusCode: error.statusCode },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Citizen reopens a report
   * POST /api/v1/reports/:id/reopen
   */
  static async reopen(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const citizenId = req.user?.userId;

      if (!citizenId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required to reopen report.', statusCode: 401 },
        });
        return;
      }

      const { reason, comment } = req.body;
      const reopenReason = reason || comment;

      if (!reopenReason || typeof reopenReason !== 'string' || !reopenReason.trim()) {
        res.status(400).json({
          success: false,
          error: { message: 'Reopen reason is required.', statusCode: 400 },
        });
        return;
      }

      const result = await ReportResolutionService.reopenReport(id, {
        citizen_id: citizenId,
        reason: reopenReason.trim(),
      });

      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: { message: error.message, statusCode: error.statusCode },
        });
        return;
      }
      next(error);
    }
  }
}
