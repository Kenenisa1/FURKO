
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
           COALESCE(
             r.photo_url,
             (SELECT file_url FROM attachments WHERE report_id = r.id LIMIT 1)
           ) AS photo_url,
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
                l.latitude, l.longitude, l.address_text, l.landmark,
                u.full_name AS citizen_name, u.phone_number AS citizen_phone, u.email AS citizen_email,
                u_staff.full_name AS assigned_staff_name, u_staff.phone_number AS assigned_staff_phone, u_staff.email AS assigned_staff_email
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN locations l ON l.id = r.location_id
         LEFT JOIN users u ON u.id = r.citizen_id
         LEFT JOIN users u_staff ON u_staff.id = r.assigned_staff_id
         WHERE (r.id::text = $1 OR r.tracking_number = $1)
           AND (r.current_institution_id = $2 OR r.current_institution_id IS NULL)`,
        [id, institutionId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Report not found in your institution.',
        });
        return;
      }

      const reportRow = result.rows[0];

      // Fetch all attached evidence and resolution proof photos
      const attachRes = await pool.query(
        `SELECT file_url, file_name, file_type, created_at 
         FROM attachments 
         WHERE report_id = $1 
         ORDER BY created_at ASC`,
        [reportRow.id]
      );

      // Fetch activity history
      const historyRes = await pool.query(
        `SELECT sh.*, u.full_name AS actor_name, u.role AS actor_role
         FROM status_history sh
         LEFT JOIN users u ON u.id = sh.changed_by_user_id
         WHERE sh.report_id = $1
         ORDER BY sh.changed_at ASC`,
        [reportRow.id]
      );

      const photos = attachRes.rows.map((a: any) => a.file_url);
      if (reportRow.photo_url && !photos.includes(reportRow.photo_url)) {
        photos.unshift(reportRow.photo_url);
      }

      const detailedReport = {
        ...reportRow,
        photos,
        attachments: attachRes.rows,
        history: historyRes.rows,
        submittedBy: {
          name: reportRow.citizen_name || 'Citizen Reporter',
          phone: reportRow.citizen_phone || '—',
          email: reportRow.citizen_email || '—',
        },
      };

      res.status(200).json({ success: true, report: detailedReport });
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

      // Update report record with assigned staff member
      await client.query(
        `UPDATE reports
         SET assigned_staff_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [staff_user_id, id]
      );

      await client.query(
        `INSERT INTO assignments
           (report_id, to_institution_id, assigned_by_user_id,
            action_type, justification_notes)
         VALUES ($1, $2, $3, 'staff_assignment', $4)`,
        [id, institutionId, userId, comment ?? `Assigned to staff user ${staff_user_id}`]
      );

      // Record the assignment in workflow history
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

  // GET /api/v1/institutions/staff
  async getStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
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
        `SELECT
           u.id,
           u.full_name AS name,
           'Institution Staff' AS role,
           i.name AS department,
           u.email,
           u.phone_number AS phone,
           CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END AS status,
           u.created_at AS "joinedAt",
           (SELECT COUNT(*)::int FROM reports r WHERE r.assigned_staff_id = u.id) AS "reportsHandled"
         FROM users u
         JOIN institutions i ON i.id = u.institution_id
         WHERE u.institution_id = $1
           AND u.role = 'staff'
         ORDER BY u.created_at DESC`,
        [institutionId]
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error('Get institution staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve staff members.' });
    }
  },

  // POST /api/v1/institutions/staff
  async createStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { name, email, phone, role } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    try {
      const institutionId = await getStaffInstitution(userId);
      if (!institutionId) {
        res.status(403).json({ success: false, message: 'Active institution staff only.' });
        return;
      }

      const defaultHash = '$2b$10$epRsf5.0.T.5.9iE/5q/ueZgG7RshgUuR2QeRj4a2l4m0tq7lG46S';

      const result = await pool.query(
        `INSERT INTO users (institution_id, full_name, email, phone_number, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, 'staff', TRUE)
         RETURNING id, full_name AS name, email, phone_number AS phone, 'Active' AS status, created_at AS "joinedAt"`,
        [institutionId, name, email, phone || null, defaultHash]
      );

      res.status(201).json({
        success: true,
        data: {
          ...result.rows[0],
          role: role || 'Institution Staff',
          department: 'Operations',
          reportsHandled: 0,
        },
      });
    } catch (error: any) {
      console.error('Create staff error:', error);
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'A user with this email already exists.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create staff member.' });
    }
  },

  // PUT /api/v1/institutions/staff/:id
  async updateStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, email, phone, status } = req.body;

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

      const isActive = status ? status === 'Active' : true;

      const result = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             email = COALESCE($2, email),
             phone_number = COALESCE($3, phone_number),
             is_active = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND institution_id = $6 AND role = 'staff'
         RETURNING id, full_name AS name, email, phone_number AS phone,
                   CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS status`,
        [name, email, phone, isActive, id, institutionId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Staff member not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to update staff member.' });
    }
  },

  // DELETE /api/v1/institutions/staff/:id
  async deleteStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      await pool.query(
        `UPDATE users SET is_active = FALSE WHERE id = $1 AND institution_id = $2 AND role = 'staff'`,
        [id, institutionId]
      );

      res.status(200).json({ success: true, message: 'Staff member deactivated.' });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to deactivate staff member.' });
    }
  },

  // GET /api/v1/institutions/profile
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
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

      const instRes = await pool.query(
        `SELECT i.*,
                (SELECT COUNT(*)::int FROM users u WHERE u.institution_id = i.id AND u.role = 'staff' AND u.is_active = TRUE) AS "staffCount",
                (SELECT COUNT(*)::int FROM reports r WHERE r.current_institution_id = i.id) AS "totalReports"
         FROM institutions i
         WHERE i.id = $1`,
        [institutionId]
      );

      if (instRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Institution not found.' });
        return;
      }

      const catRes = await pool.query(
        `SELECT DISTINCT c.name
         FROM routing_rules rr
         JOIN categories c ON c.id = rr.category_id
         WHERE rr.target_institution_id = $1 AND rr.is_active = TRUE`,
        [institutionId]
      );

      const inst = instRes.rows[0];

      res.status(200).json({
        success: true,
        data: {
          id: inst.id,
          name: inst.name,
          code: inst.code,
          type: 'Municipal Authority',
          description: inst.description || 'Public service provider for Jimma City.',
          email: inst.contact_email,
          phone: inst.contact_phone || '+251471112222',
          website: `www.${(inst.code || 'jimma').toLowerCase()}.gov.et`,
          address: 'Jimma City Administration Building, Jimma, Ethiopia',
          serviceArea: 'Jimma City (All 17 Kebeles)',
          established: '1994',
          staffCount: inst.staffCount || 1,
          totalReports: inst.totalReports || 0,
          responsibleCategories: catRes.rows.map((r: any) => r.name),
        },
      });
    } catch (error) {
      console.error('Get institution profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve institution profile.' });
    }
  },

  // PUT /api/v1/institutions/profile
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { email, phone, description, name } = req.body;

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
        `UPDATE institutions
         SET contact_email = COALESCE($1, contact_email),
             contact_phone = COALESCE($2, contact_phone),
             description = COALESCE($3, description),
             name = COALESCE($4, name),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [email, phone, description, name, institutionId]
      );

      res.status(200).json({
        success: true,
        message: 'Institution profile updated successfully.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Update institution profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update institution profile.' });
    }
  },

  // GET /api/v1/institutions/list (active institutions list for dropdowns)
  async listInstitutions(_req: any, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT id, name, code, contact_email, contact_phone
         FROM institutions
         WHERE is_active = TRUE
         ORDER BY name ASC`
      );

      res.status(200).json({
        success: true,
        data: result.rows,
        institutions: result.rows,
      });
    } catch (error) {
      console.error('List institutions error:', error);
      res.status(500).json({ success: false, message: 'Failed to list institutions.' });
    }
  },
};
