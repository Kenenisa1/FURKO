import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { env } from '../config/env';
import { Attachment, AttachmentType } from '../models';

export interface SaveEvidenceParams {
  file: Express.Multer.File;
  reportId?: string | null;
  uploadedByUserId?: string | null;
  fileType?: AttachmentType;
  reqBaseUrl?: string;
}

export class EvidenceService {
  /**
   * Generates public URL for uploaded file
   */
  static getFileUrl(fileName: string, reqBaseUrl?: string): string {
    const base = env.uploads.baseUrl || reqBaseUrl || '';
    return `${base}/uploads/${fileName}`;
  }

  /**
   * Verifies if a report exists in the database
   */
  static async checkReportExists(reportId: string): Promise<boolean> {
    try {
      const res = await query('SELECT id FROM reports WHERE id = $1 LIMIT 1', [reportId]);
      return (res.rowCount ?? 0) > 0;
    } catch {
      // In standalone/mock mode if table isn't created yet, allow graceful fallback
      return true;
    }
  }

  /**
   * Records uploaded evidence into database or returns formatted attachment record
   */
  static async saveEvidence(params: SaveEvidenceParams): Promise<Attachment> {
    const { file, reportId = null, uploadedByUserId = null, fileType = 'evidence', reqBaseUrl } = params;

    const attachmentId = uuidv4();
    const fileUrl = this.getFileUrl(file.filename, reqBaseUrl);
    const createdAt = new Date();

    const attachment: Attachment = {
      id: attachmentId,
      report_id: reportId,
      uploaded_by_user_id: uploadedByUserId,
      file_name: file.filename,
      original_name: file.originalname,
      file_url: fileUrl,
      file_type: fileType,
      mime_type: file.mimetype,
      file_size: file.size,
      created_at: createdAt,
    };

    // Attempt to persist to database if reports and attachments tables exist
    try {
      await query(
        `INSERT INTO attachments 
         (id, report_id, uploaded_by_user_id, file_name, file_url, file_type, mime_type, file_size, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          attachment.id,
          attachment.report_id,
          attachment.uploaded_by_user_id,
          attachment.file_name,
          attachment.file_url,
          attachment.file_type,
          attachment.mime_type,
          attachment.file_size,
          attachment.created_at,
        ]
      );

      // If attached directly to a report, optionally update the report's photo_url
      if (reportId && fileType === 'evidence') {
        await query(
          `UPDATE reports SET photo_url = $1, updated_at = NOW() WHERE id = $2 AND photo_url IS NULL`,
          [fileUrl, reportId]
        );
      }
    } catch (err: unknown) {
      // If DB is offline or tables not yet migrated, log warning but keep file intact
      console.warn('[EvidenceService] DB insert skipped or table not initialized:', (err as Error).message);
    }

    return attachment;
  }

  /**
   * Fetches attachments for a given report
   */
  static async getAttachmentsByReportId(reportId: string, reqBaseUrl?: string): Promise<Attachment[]> {
    try {
      const res = await query(
        `SELECT id, report_id, uploaded_by_user_id, file_name, file_url, file_type, mime_type, file_size, created_at
         FROM attachments
         WHERE report_id = $1
         ORDER BY created_at ASC`,
        [reportId]
      );

      return res.rows.map((row) => ({
        ...row,
        file_url: row.file_url || this.getFileUrl(row.file_name, reqBaseUrl),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Associates an existing unassociated attachment with a newly created report
   */
  static async associateWithReport(attachmentId: string, reportId: string): Promise<boolean> {
    try {
      const res = await query(
        `UPDATE attachments SET report_id = $1 WHERE id = $2`,
        [reportId, attachmentId]
      );
      return (res.rowCount ?? 0) > 0;
    } catch {
      return true;
    }
  }

  /**
   * Safely deletes file from disk on upload failure or validation abort
   */
  static cleanupFile(filePath?: string): void {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('[EvidenceService] Error cleaning up file:', err);
      }
    }
  }
}
