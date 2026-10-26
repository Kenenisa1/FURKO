
import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const reportController = {
  async getMyReports(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Get the citizen ID from the verified JWT.
      const citizenId = req.user?.userId;

      if (!citizenId) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const result = await pool.query(
        `
        SELECT
          r.id,
          r.tracking_number,
          r.title,
          r.description,
          r.status,
          r.priority,
          r.urgency,
          r.submitted_at,
          r.resolved_at,
          COALESCE(
            r.photo_url,
            (SELECT file_url FROM attachments WHERE report_id = r.id AND file_type = 'evidence' LIMIT 1)
          ) AS photo_url,
          c.id AS category_id,
          c.name AS category_name,
          l.latitude,
          l.longitude,
          l.address_text,
          l.landmark,
          i.name AS institution_name
        FROM reports r
        LEFT JOIN categories c ON c.id = r.category_id
        LEFT JOIN locations l ON l.id = r.location_id
        LEFT JOIN institutions i ON i.id = r.current_institution_id
        WHERE r.citizen_id = $1
        ORDER BY r.submitted_at DESC
        `,
        [citizenId]
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error('Get citizen reports error:', error);
      res.status(500).json({
        error: 'Failed to retrieve reports.',
      });
    }
  },
};
