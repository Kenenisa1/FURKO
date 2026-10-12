import { Request, Response, NextFunction } from 'express';
import { EvidenceService } from '../services/evidence.service';
import { AttachmentType } from '../models';

export class EvidenceController {
  /**
   * Upload single evidence/photo file
   * POST /api/v1/evidence/upload
   * Form-Data: file (binary), report_id (optional), file_type (optional: 'evidence' | 'resolution_proof')
   */
  static async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            message: 'No file provided. Please attach an image file using the field name "file" or "evidence".',
            statusCode: 400,
          },
        });
        return;
      }

      const { report_id, file_type = 'evidence', user_id } = req.body;

      // If report_id was provided, validate format or check existence
      if (report_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(report_id) && !report_id.startsWith('rep-')) {
          // Clean up uploaded file if invalid report ID passed
          EvidenceService.cleanupFile(req.file.path);
          res.status(400).json({
            success: false,
            error: {
              message: `Invalid report_id format: "${report_id}". Expected valid UUID or report identifier.`,
              statusCode: 400,
            },
          });
          return;
        }

        const exists = await EvidenceService.checkReportExists(report_id);
        if (!exists) {
          EvidenceService.cleanupFile(req.file.path);
          res.status(404).json({
            success: false,
            error: {
              message: `Report with id "${report_id}" not found.`,
              statusCode: 404,
            },
          });
          return;
        }
      }

      const reqProtocol = req.protocol;
      const reqHost = req.get('host') || 'localhost:5000';
      const reqBaseUrl = `${reqProtocol}://${reqHost}`;

      const attachment = await EvidenceService.saveEvidence({
        file: req.file,
        reportId: report_id || null,
        uploadedByUserId: (req as Request & { user?: { id?: string } }).user?.id || user_id || null,
        fileType: (file_type as AttachmentType) || 'evidence',
        reqBaseUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Evidence uploaded successfully',
        data: {
          id: attachment.id,
          report_id: attachment.report_id,
          file_name: attachment.file_name,
          original_name: attachment.original_name,
          file_url: attachment.file_url,
          file_type: attachment.file_type,
          mime_type: attachment.mime_type,
          file_size: attachment.file_size,
          created_at: attachment.created_at,
        },
      });
    } catch (error) {
      if (req.file) {
        EvidenceService.cleanupFile(req.file.path);
      }
      next(error);
    }
  }

  /**
   * Upload evidence associated with a specific report
   * POST /api/v1/reports/:id/evidence
   */
  static async uploadForReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: report_id } = req.params;
      req.body.report_id = report_id;
      return EvidenceController.upload(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all attachments for a specific report
   * GET /api/v1/reports/:id/evidence
   */
  static async getReportEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: report_id } = req.params;
      const reqProtocol = req.protocol;
      const reqHost = req.get('host') || 'localhost:5000';
      const reqBaseUrl = `${reqProtocol}://${reqHost}`;

      const attachments = await EvidenceService.getAttachmentsByReportId(report_id, reqBaseUrl);

      res.status(200).json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }
}
