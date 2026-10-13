
import { Response } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Verify active institution staff and return their institution ID.
async function getStaffInstitution(userId: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT u.institution_id
     FROM users u
     JOIN institutions i ON i.id = u.institution_id
     WHERE u.id = $1
       AND u.role = 'staff'
       AND u.is_active = TRUE
       AND i.is_active = TRUE`,
    [userId]
  );

  return result.rows[0]?.institution_id ?? null;
}

export const InstitutionWorkflowController = {
  // GET /api/v1/institutions/reports
  async getInbox(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    try {
      const institutionId = await getStaffInstitution(userId);

      if (!institutionId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Active institution staff only.',
        });
        return;
      }

      const result = await pool.query(
        `SELECT
           r.id,
           r.tracking_number,
           r.title,
           r.description,
           r.status,
           r.priority,
           r.submitted_at,
           c.id AS category_id,
           c.name AS category_name,
           l.latitude,
           l.longitude,
           l.address_text,
           l.landmark
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN locations l ON l.id = r.location_id
         WHERE r.current_institution_id = $1
         ORDER BY r.submitted_at DESC`,
        [institutionId]
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        reports: result.rows,
      });
    } catch (error) {
      console.error('Institution inbox error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve institution reports.',
      });
    }
  },

  // GET /api/v1/institutions/reports/:id
  // Review one report belonging to this institution.
  async reviewReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      const institutionId = await getStaffInstitution(userId);

      if (!institutionId) {
        res.status(403).json({ success: false, message: 'Active institution staff only.' });
        return;
      }

      const result = await pool.query(
        `SELECT r.*, c.name AS category_name,
                l.latitude, l.longitude, l.address_text, l.landmark
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN locations l ON l.id = r.location_id
         WHERE r.id = $1 AND r.current_institution_id = $2`,
        [id, institutionId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Report not found in your institution.',
        });
        return;
      }

      res.status(200).json({ success: true, report: result.rows[0] });
    } catch (error) {
      console.error('Review report error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve report.' });
    }
  },

  // Shared workflow operation for accept, reject, redirect, and status updates.
  async changeReportStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { action, comment, institution_id, status } = req.body as {
      action?: string;
      comment?: string;
      institution_id?: string;
      status?: string;
    };

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const transitions: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      redirect: 'redirected',
      start: 'in_progress',
      resolve: 'resolved',
    };

    const allowedStatuses = ['under_review', 'in_progress', 'resolved'];

    let newStatus: string | undefined;

    if (action && transitions[action]) {
      newStatus = transitions[action];
    } else if (status && allowedStatuses.includes(status)) {
      newStatus = status;
    }

    if (!newStatus) {
      res.status(400).json({
        success: false,
        message: 'Invalid action or status.',
      });
      return;
    }

    if (action === 'redirect' && !institution_id) {
      res.status(400).json({
        success: false,
        message: 'institution_id is required for redirection.',
      });
      return;
    }

    const client = await pool.connect();

    try {
      const staffResult = await client.query(
        `SELECT u.institution_id
         FROM users u
         JOIN institutions i ON i.id = u.institution_id
         WHERE u.id = $1
           AND u.role = 'staff'
           AND u.is_active = TRUE
           AND i.is_active = TRUE`,
        [userId]
      );

      if (staffResult.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: 'Active institution staff only.',
        });
        return;
      }

      const institutionId = staffResult.rows[0].institution_id;

      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status
         FROM reports
         WHERE id = $1 AND current_institution_id = $2
         FOR UPDATE`,
        [id, institutionId]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({
          success: false,
          message: 'Report not found in your institution.',
        });
        return;
      }

      const previousStatus = reportResult.rows[0].status as string;

      // Prevent changing a report after it has reached a final state.
      if (['resolved', 'rejected'].includes(previousStatus)) {
        await client.query('ROLLBACK');
        res.status(409).json({
          success: false,
          message: 'This report is already in a final state.',
        });
        return;
      }

      // Redirect only to a different active institution.
      if (action === 'redirect') {
        const target = await client.query(
          `SELECT id FROM institutions
           WHERE id = $1 AND is_active = TRUE`,
          [institution_id]
        );

        if (target.rows.length === 0 || institution_id === institutionId) {
          await client.query('ROLLBACK');
          res.status(400).json({
            success: false,
            message: 'Choose a different active institution.',
          });
          return;
        }
      }

      const updated = await client.query(
        `UPDATE reports
         SET status = $1,
             current_institution_id =
               CASE WHEN $2 = 'redirect' THEN $3::uuid
                    ELSE current_institution_id END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, tracking_number, status, current_institution_id`,
        [newStatus, action ?? '', institution_id ?? null, id]
      );

      if (action === 'redirect') {
        await client.query(
          `INSERT INTO assignments
             (report_id, to_institution_id, assigned_by_user_id,
              action_type, justification_notes)
           VALUES ($1, $2, $3, 'redirect', $4)`,
          [id, institution_id, userId, comment ?? null]
        );
      }

      await client.query(
        `INSERT INTO status_history
           (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, userId, previousStatus, newStatus, comment ?? null]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: `Report ${action ?? 'status'} updated successfully.`,
        report: updated.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Change report status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report workflow.',
      });
    } finally {
      client.release();
    }
  },

  // POST /api/v1/institutions/reports/:id/assign
  // Assign the report to a staff member within the same institution.
  async assignStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { staff_user_id, comment } = req.body as {
      staff_user_id?: string;
      comment?: string;
    };

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!staff_user_id) {
      res.status(400).json({ success: false, message: 'staff_user_id is required.' });
      return;
    }

    const client = await pool.connect();

    try {
      const institutionId = await getStaffInstitution(userId);

      if (!institutionId) {
        res.status(403).json({ success: false, message: 'Active institution staff only.' });
        return;
      }

      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status FROM reports
         WHERE id = $1 AND current_institution_id = $2
         FOR UPDATE`,
        [id, institutionId]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({
          success: false,
          message: 'Report not found in your institution.',
        });
        return;
      }

      const staffResult = await client.query(
        `SELECT id FROM users
         WHERE id = $1
           AND institution_id = $2
           AND role = 'staff'
           AND is_active = TRUE`,
        [staff_user_id, institutionId]
      );

      if (staffResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: 'The selected staff member is not active staff in your institution.',
        });
        return;
      }

      const previousStatus = reportResult.rows[0].status as string;

      await client.query(
        `INSERT INTO assignments
           (report_id, to_institution_id, assigned_by_user_id,
            action_type, justification_notes)
         VALUES ($1, $2, $3, 'staff_assignment', $4)`,
        [id, institutionId, userId, comment ?? `Assigned to staff user ${staff_user_id}`]
      );

      // Record the assignment in workflow history without inventing a
      // staff-assignee column that does not exist in the current schema.
      await client.query(
        `INSERT INTO status_history
           (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $3, $4)`,
        [id, userId, previousStatus, comment ?? `Assigned to staff user ${staff_user_id}`]
      );

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Assignment recorded successfully.',
        report_id: id,
        staff_user_id,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Assign staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign staff member.',
      });
    } finally {
      client.release();
    }
  },

  // GET /api/v1/institutions/reports/:id/history
  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      const institutionId = await getStaffInstitution(userId);

      if (!institutionId) {
        res.status(403).json({ success: false, message: 'Active institution staff only.' });
        return;
      }

      const reportResult = await pool.query(
        `SELECT id FROM reports
         WHERE id = $1 AND current_institution_id = $2`,
        [id, institutionId]
      );

      if (reportResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Report not found in your institution.',
        });
        return;
      }

      const history = await pool.query(
        `SELECT h.id, h.previous_status, h.new_status, h.comment,
                h.changed_at, u.full_name AS changed_by
         FROM status_history h
         LEFT JOIN users u ON u.id = h.changed_by_user_id
         WHERE h.report_id = $1
         ORDER BY h.changed_at DESC`,
        [id]
      );

      res.status(200).json({
        success: true,
        count: history.rows.length,
        history: history.rows,
      });
    } catch (error) {
      console.error('Get workflow history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve workflow history.',
      });
    }
  },
};
