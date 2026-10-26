
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const ReportController = {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { category_id, title, description, latitude, longitude, address_text, landmark, urgency, sub_issue, photo_url } = req.body;
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

      // 1. Resolve category flexibly (by UUID, slug, name, or keyword)
      let resolvedCategoryId: string | null = null;
      let categoryName = 'Civic Issue';
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(category_id));

      if (isUuid) {
        const catRes = await client.query('SELECT id, name FROM categories WHERE id = $1 AND is_active = TRUE', [category_id]);
        if (catRes.rowCount && catRes.rowCount > 0) {
          resolvedCategoryId = catRes.rows[0].id;
          categoryName = catRes.rows[0].name;
        }
      }

      if (!resolvedCategoryId) {
        const slugKeyword = String(category_id).toLowerCase().replace(/^cat-/, '').replace(/-\d+$/, '');
        const catRes = await client.query(
          `SELECT id, name FROM categories 
           WHERE is_active = TRUE 
             AND (slug ILIKE $1 OR name ILIKE $1 OR slug ILIKE $2 OR name ILIKE $2)
           ORDER BY created_at ASC
           LIMIT 1`,
          [String(category_id), `%${slugKeyword}%`]
        );
        if (catRes.rowCount && catRes.rowCount > 0) {
          resolvedCategoryId = catRes.rows[0].id;
          categoryName = catRes.rows[0].name;
        }
      }

      if (!resolvedCategoryId) {
        const fallbackCat = await client.query('SELECT id, name FROM categories WHERE is_active = TRUE LIMIT 1');
        if (fallbackCat.rowCount && fallbackCat.rowCount > 0) {
          resolvedCategoryId = fallbackCat.rows[0].id;
          categoryName = fallbackCat.rows[0].name;
        } else {
          await client.query('ROLLBACK');
          res.status(400).json({ error: 'No active category found.' });
          return;
        }
      }

      // 2. Insert location with PostGIS geometry
      const location = await client.query(
        `INSERT INTO locations (latitude, longitude, geom, address_text, landmark)
         VALUES ($1::numeric, $2::numeric, ST_SetSRID(ST_MakePoint($2::double precision, $1::double precision), 4326), $3, $4)
         RETURNING id, latitude, longitude, address_text, landmark`,
        [Number(latitude), Number(longitude), address_text || null, landmark || null]
      );

      // 3. Automated Routing to Target Institution
      let targetInstitutionId: string | null = null;
      let targetInstitutionName = 'Municipal Dispatch Desk';

      const spatialRule = await client.query(
        `SELECT r.target_institution_id, i.name AS institution_name
         FROM routing_rules r
         JOIN institutions i ON i.id = r.target_institution_id
         WHERE r.category_id = $1
           AND r.is_active = TRUE
           AND i.is_active = TRUE
           AND (r.location_bounds IS NULL OR ST_Contains(r.location_bounds, ST_SetSRID(ST_MakePoint($3::double precision, $2::double precision), 4326)))
         ORDER BY r.priority_weight DESC
         LIMIT 1`,
        [resolvedCategoryId, Number(latitude), Number(longitude)]
      );

      if (spatialRule.rowCount && spatialRule.rowCount > 0) {
        targetInstitutionId = spatialRule.rows[0].target_institution_id;
        targetInstitutionName = spatialRule.rows[0].institution_name;
      } else {
        const fallbackRule = await client.query(
          `SELECT r.target_institution_id, i.name AS institution_name
           FROM routing_rules r
           JOIN institutions i ON i.id = r.target_institution_id
           WHERE r.category_id = $1 AND r.is_active = TRUE AND i.is_active = TRUE
           LIMIT 1`,
          [resolvedCategoryId]
        );
        if (fallbackRule.rowCount && fallbackRule.rowCount > 0) {
          targetInstitutionId = fallbackRule.rows[0].target_institution_id;
          targetInstitutionName = fallbackRule.rows[0].institution_name;
        }
      }

      // 4. Generate Tracking Number & Insert Report
      const trackingNumber = `FRK-${randomUUID().slice(0, 8).toUpperCase()}`;
      const reportPriority = urgency === 'emergency' ? 'urgent' : (urgency === 'high' ? 'high' : 'medium');

      const report = await client.query(
        `INSERT INTO reports
           (tracking_number, citizen_id, category_id, location_id, current_institution_id,
            title, description, status, priority, urgency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', $8, $9)
         RETURNING id, tracking_number, citizen_id, category_id, location_id, current_institution_id,
                   title, description, status, priority, urgency, submitted_at`,
        [
          trackingNumber,
          citizenId,
          resolvedCategoryId,
          location.rows[0].id,
          targetInstitutionId,
          title.trim(),
          description.trim(),
          reportPriority,
          urgency || 'medium',
        ]
      );

      const createdReport = report.rows[0];

      // 5. Initial Status History Entry
      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, NULL, 'submitted', 'Report submitted with GPS location and dispatched.')`,
        [createdReport.id, citizenId]
      );

      // 6. Direct Routing Assignment Record
      if (targetInstitutionId) {
        await client.query(
          `INSERT INTO assignments (report_id, to_institution_id, assigned_by_user_id, action_type, justification_notes)
           VALUES ($1, $2, $3, 'direct_routing', 'Directly routed based on category and spatial boundary.')`,
          [createdReport.id, targetInstitutionId, citizenId]
        );
      }

      // 7. Optional Photo / Evidence Attachment
      if (photo_url) {
        await client.query(
          `INSERT INTO attachments (report_id, uploaded_by_user_id, file_name, file_url, file_type)
           VALUES ($1, $2, 'report_evidence.jpg', $3, 'evidence')`,
          [createdReport.id, citizenId, photo_url]
        );
      }

      await client.query('COMMIT');

      const fullReport = {
        ...createdReport,
        category_name: categoryName,
        institution_name: targetInstitutionName,
        location: location.rows[0],
        latitude: location.rows[0].latitude,
        longitude: location.rows[0].longitude,
        address_text: location.rows[0].address_text,
        landmark: location.rows[0].landmark,
        photo_url: photo_url || undefined,
      };

      res.status(201).json({
        success: true,
        report: fullReport,
        data: fullReport,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Failed to create report.' });
    } finally {
      client.release();
    }
  },
};
