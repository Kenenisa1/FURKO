
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const ReportController = {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { category_id, title, description, latitude, longitude, address_text, landmark } = req.body;
    const citizenId = req.user?.userId;

    if (!citizenId) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (
      typeof title !== 'string' || !title.trim() || title.trim().length > 200 ||
      typeof description !== 'string' || !description.trim() ||
      !category_id ||
      latitude === undefined || longitude === undefined ||
      !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
      Number(latitude) < -90 || Number(latitude) > 90 ||
      Number(longitude) < -180 || Number(longitude) > 180
    ) {
      res.status(400).json({ error: 'Invalid title, description, category, or location.' });
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const category = await client.query(
        'SELECT id FROM categories WHERE id = $1 AND is_active = TRUE',
        [category_id]
      );

      if (category.rowCount === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Invalid or inactive category.' });
        return;
      }

      const location = await client.query(
        `INSERT INTO locations (latitude, longitude, geom, address_text, landmark)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3, $4)
         RETURNING id, latitude, longitude, address_text, landmark`,
        [Number(latitude), Number(longitude), address_text || null, landmark || null]
      );

      const trackingNumber = `FRK-${randomUUID()}`;

      const report = await client.query(
        `INSERT INTO reports
           (tracking_number, citizen_id, category_id, location_id, title, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, tracking_number, citizen_id, category_id, location_id,
                   title, description, status, submitted_at`,
        [trackingNumber, citizenId, category_id, location.rows[0].id, title.trim(), description.trim()]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, report: { ...report.rows[0], location: location.rows[0] } });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Failed to create report.' });
    } finally {
      client.release();
    }
  },
};
