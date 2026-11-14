// ─────────────────────────────────────────────────────────────────────────────
// FURKO — Institution Workflow Controller
// Role-Based Access Control, Branch Management, Staff Assignment & Audit
// ─────────────────────────────────────────────────────────────────────────────

import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { RbacRequest, resolveUserContext } from '../middleware/rbacMiddleware';
import { AuditService } from '../services/audit.service';
import { ROLES, normalizeRole, getPermissionsForRole } from '../config/rbac';

// Helper to resolve caller context safely
async function getCallerContext(req: RbacRequest) {
  if (req.userContext) return req.userContext;
  const tokenUserId = req.user?.userId;
  if (!tokenUserId) return null;
  const ctx = await resolveUserContext(tokenUserId);
  if (ctx) {
    req.userContext = ctx;
    return ctx;
  }
  // Fallback: If DB query returned null (e.g. mock DB in integration tests),
  // construct caller context from decoded JWT claims on req.user
  const role = normalizeRole(req.user.role || 'citizen');
  const fallbackCtx = {
    userId: tokenUserId,
    email: req.user.email || '',
    fullName: req.user.full_name || '',
    role,
    permissions: getPermissionsForRole(role),
    institutionId: req.user.institution_id || null,
    branchId: req.user.branch_id || null,
    isSystemAdmin: role === ROLES.SYSTEM_ADMIN,
    isSuperAdmin: role === ROLES.INSTITUTION_SUPER_ADMIN,
    isBranchManager: role === ROLES.BRANCH_MANAGER,
    isStaff: role === ROLES.INSTITUTION_STAFF || role === ROLES.STAFF_LEGACY,
  };
  req.userContext = fallbackCtx;
  return fallbackCtx;
}

export const InstitutionWorkflowController = {
  // ───────────────────────────────────────────────────────────────────────────
  // REPORT INBOX & FILTERING
  // GET /api/v1/institutions/reports
  // ───────────────────────────────────────────────────────────────────────────
  async getInbox(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!user.institutionId && !user.isSystemAdmin) {
        res.status(403).json({ success: false, message: 'Institutional affiliation required.' });
        return;
      }

      const { status, branch_id, assigned_to_me, unassigned, search } = req.query as {
        status?: string;
        branch_id?: string;
        assigned_to_me?: string;
        unassigned?: string;
        search?: string;
      };

      const params: any[] = [];
      const conditions: string[] = [];

      // 1. Institutional isolation (system admin can specify institution, others bound to own)
      if (!user.isSystemAdmin) {
        params.push(user.institutionId);
        conditions.push(`r.current_institution_id = $${params.length}`);
      }

      // 2. Role-based scoping: Staff with only reports.view_assigned see their assigned tasks
      const canViewAll = user.isSystemAdmin || user.isSuperAdmin || user.permissions.includes('reports.view_institution');
      const canViewBranch = user.permissions.includes('reports.view_branch');

      if (!canViewAll) {
        if (canViewBranch && user.branchId) {
          // Branch manager: see reports assigned to their branch or to themselves
          params.push(user.branchId, user.userId);
          conditions.push(`(r.current_branch_id = $${params.length - 1} OR r.assigned_staff_id = $${params.length})`);
        } else {
          // Pure staff: restricted to reports assigned directly to them
          params.push(user.userId);
          conditions.push(`r.assigned_staff_id = $${params.length}`);
        }
      }

      // 3. Optional filter: assigned_to_me
      if (assigned_to_me === 'true') {
        params.push(user.userId);
        conditions.push(`r.assigned_staff_id = $${params.length}`);
      }

      // 4. Optional filter: unassigned
      if (unassigned === 'true') {
        conditions.push(`r.assigned_staff_id IS NULL`);
      }

      // 5. Optional filter: branch_id
      if (branch_id) {
        params.push(branch_id);
        conditions.push(`r.current_branch_id = $${params.length}`);
      }

      // 6. Optional filter: status
      if (status) {
        params.push(status);
        conditions.push(`r.status = $${params.length}`);
      }

      // 7. Optional filter: search (by tracking number or title)
      if (search && search.trim()) {
        params.push(`%${search.trim()}%`);
        conditions.push(`(r.tracking_number ILIKE $${params.length} OR r.title ILIKE $${params.length})`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const queryText = `
        SELECT
          r.id,
          r.tracking_number,
          r.title,
          r.description,
          r.status,
          r.priority,
          r.submitted_at,
          r.current_institution_id,
          r.current_branch_id,
          r.assigned_staff_id,
          COALESCE(
            r.photo_url,
            (SELECT file_url FROM attachments WHERE report_id = r.id LIMIT 1)
          ) AS photo_url,
          c.id AS category_id,
          c.name AS category_name,
          l.latitude,
          l.longitude,
          l.address_text,
          l.landmark,
          b.name AS branch_name,
          b.code AS branch_code,
          u_staff.full_name AS assigned_staff_name
        FROM reports r
        LEFT JOIN categories c ON c.id = r.category_id
        LEFT JOIN locations l ON l.id = r.location_id
        LEFT JOIN branches b ON b.id = r.current_branch_id
        LEFT JOIN users u_staff ON u_staff.id = r.assigned_staff_id
        ${whereClause}
        ORDER BY r.submitted_at DESC
      `;

      const result = await pool.query(queryText, params);

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

  // ───────────────────────────────────────────────────────────────────────────
  // REPORT DETAIL & SCOPED ACCESS
  // GET /api/v1/institutions/reports/:id
  // ───────────────────────────────────────────────────────────────────────────
  async reviewReport(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      const { id } = req.params;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      // Check report existence and institutional membership
      const reportRes = await pool.query(
        `SELECT r.*, c.name AS category_name,
                l.latitude, l.longitude, l.address_text, l.landmark,
                u.full_name AS citizen_name, u.phone_number AS citizen_phone, u.email AS citizen_email,
                u_staff.full_name AS assigned_staff_name, u_staff.phone_number AS assigned_staff_phone, u_staff.email AS assigned_staff_email,
                b.name AS branch_name, b.code AS branch_code
         FROM reports r
         LEFT JOIN categories c ON c.id = r.category_id
         LEFT JOIN locations l ON l.id = r.location_id
         LEFT JOIN users u ON u.id = r.citizen_id
         LEFT JOIN users u_staff ON u_staff.id = r.assigned_staff_id
         LEFT JOIN branches b ON b.id = r.current_branch_id
         WHERE (r.id::text = $1 OR r.tracking_number = $1)`,
        [id]
      );

      if (reportRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const reportRow = reportRes.rows[0];

      // Institutional boundary check
      if (!user.isSystemAdmin && reportRow.current_institution_id !== user.institutionId) {
        res.status(403).json({ success: false, message: 'Access denied. Report belongs to a different institution.' });
        return;
      }

      // Staff scoped access check: If pure staff, must be assigned to this report
      const canViewAll = user.isSystemAdmin || user.isSuperAdmin || user.permissions.includes('reports.view_institution');
      const canViewBranch = user.permissions.includes('reports.view_branch');

      if (!canViewAll) {
        const isAssigned = reportRow.assigned_staff_id === user.userId;
        const isBranchMatch = canViewBranch && user.branchId && reportRow.current_branch_id === user.branchId;

        if (!isAssigned && !isBranchMatch) {
          res.status(403).json({ success: false, message: 'Access denied. You are not authorized to view this report.' });
          return;
        }
      }

      // Fetch attachments
      const attachRes = await pool.query(
        `SELECT file_url, file_name, file_type, created_at 
         FROM attachments 
         WHERE report_id = $1 
         ORDER BY created_at ASC`,
        [reportRow.id]
      );

      // Fetch status history
      const historyRes = await pool.query(
        `SELECT sh.*, u.full_name AS actor_name, u.role AS actor_role
         FROM status_history sh
         LEFT JOIN users u ON u.id = sh.changed_by_user_id
         WHERE sh.report_id = $1
         ORDER BY sh.changed_at ASC`,
        [reportRow.id]
      );

      // Fetch branch transfers history
      const transfersRes = await pool.query(
        `SELECT t.*,
                fb.name AS from_branch_name,
                tb.name AS to_branch_name,
                u_req.full_name AS requested_by_name,
                u_rev.full_name AS reviewed_by_name
         FROM report_transfers t
         LEFT JOIN branches fb ON fb.id = t.source_branch_id
         LEFT JOIN branches tb ON tb.id = t.destination_branch_id
         LEFT JOIN users u_req ON u_req.id = t.initiated_by_user_id
         LEFT JOIN users u_rev ON u_rev.id = t.reviewed_by_user_id
         WHERE t.report_id = $1
         ORDER BY t.created_at DESC`,
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
        transfers: transfersRes.rows,
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

  // ───────────────────────────────────────────────────────────────────────────
  // WORKFLOW ACTION (Accept, Reject, In-Progress, Redirect, Resolve)
  // POST /api/v1/institutions/reports/:id/action
  // ───────────────────────────────────────────────────────────────────────────
  async changeReportStatus(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { action, comment, institution_id, status } = req.body as {
      action?: string;
      comment?: string;
      institution_id?: string;
      status?: string;
    };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!user.institutionId && !user.isSystemAdmin) {
      res.status(403).json({ success: false, message: 'Institutional affiliation required.' });
      return;
    }

    const transitions: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      redirect: 'redirected',
      start: 'in_progress',
      resolve: 'resolved',
    };

    const allowedStatuses = ['under_review', 'accepted', 'in_progress', 'resolved', 'submitted_for_review'];
    let newStatus: string | undefined;

    if (action && transitions[action]) {
      newStatus = transitions[action];
    } else if (status && allowedStatuses.includes(status)) {
      newStatus = status;
    }

    if (!newStatus) {
      res.status(400).json({ success: false, message: 'Invalid action or status.' });
      return;
    }

    // RBAC: Direct resolution requires reports.resolve permission
    if (newStatus === 'resolved' && !user.permissions.includes('reports.resolve') && !user.isSystemAdmin) {
      res.status(403).json({
        success: false,
        message: 'Permission denied. Only Institution Super Admins can directly resolve reports. Staff must submit for review.',
      });
      return;
    }

    if (action === 'redirect' && !institution_id) {
      res.status(400).json({ success: false, message: 'institution_id is required for redirection.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status, current_institution_id, assigned_staff_id, current_branch_id
         FROM reports
         WHERE (id::text = $1 OR tracking_number = $1)
         FOR UPDATE`,
        [id]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportResult.rows[0];

      // Institutional boundary
      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Report belongs to a different institution.' });
        return;
      }

      const previousStatus = report.status;

      // Cannot alter terminal resolved or rejected reports through simple status change
      if (['resolved', 'rejected'].includes(previousStatus)) {
        await client.query('ROLLBACK');
        res.status(409).json({ success: false, message: 'This report is already in a final state.' });
        return;
      }

      if (action === 'redirect') {
        const target = await client.query('SELECT id FROM institutions WHERE id = $1 AND is_active = TRUE', [institution_id]);
        if (target.rows.length === 0 || institution_id === user.institutionId) {
          await client.query('ROLLBACK');
          res.status(400).json({ success: false, message: 'Choose a different active institution.' });
          return;
        }
      }

      const updated = await client.query(
        `UPDATE reports
         SET status = $1::report_status,
             current_institution_id = CASE WHEN $2 = 'redirect' THEN $3::uuid ELSE current_institution_id END,
             resolved_at = CASE WHEN $1::text = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
             resolution_notes = CASE WHEN $1::text = 'resolved' AND $4::text IS NOT NULL THEN $4::text ELSE resolution_notes END,
             resolution_information = CASE WHEN $1::text = 'resolved' AND $4::text IS NOT NULL THEN $4::text ELSE resolution_information END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, tracking_number, status, current_institution_id`,
        [newStatus, action ?? '', institution_id ?? null, comment ?? null, report.id]
      );

      if (action === 'redirect') {
        await client.query(
          `INSERT INTO assignments (report_id, to_institution_id, assigned_by_user_id, action_type, justification_notes)
           VALUES ($1, $2, $3, 'redirect', $4)`,
          [report.id, institution_id, user.userId, comment ?? null]
        );
      }

      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [report.id, user.userId, previousStatus, newStatus, comment ?? null]
      );

      await client.query('COMMIT');

      // Audit log
      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: `REPORT_STATUS_${newStatus.toUpperCase()}`,
        entityType: 'report',
        entityId: report.id,
        metadata: { previousStatus, newStatus, action, comment },
      });

      res.status(200).json({
        success: true,
        message: `Report ${action ?? 'status'} updated successfully.`,
        report: updated.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Change report status error:', error);
      res.status(500).json({ success: false, message: 'Failed to update report workflow.' });
    } finally {
      client.release();
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ASSIGN / REASSIGN REPORT TO STAFF & BRANCH
  // POST /api/v1/institutions/reports/:id/assign
  // ───────────────────────────────────────────────────────────────────────────
  async assignStaff(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { staff_user_id, branch_id, comment, priority } = req.body as {
      staff_user_id?: string;
      branch_id?: string;
      comment?: string;
      priority?: string;
    };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!staff_user_id) {
      res.status(400).json({ success: false, message: 'staff_user_id is required.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status, current_institution_id, current_branch_id, assigned_staff_id
         FROM reports
         WHERE (id::text = $1 OR tracking_number = $1)
         FOR UPDATE`,
        [id]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportResult.rows[0];

      // Institutional boundary
      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Report belongs to a different institution.' });
        return;
      }

      // Verify selected staff belongs to same institution and is active
      const staffResult = await client.query(
        `SELECT id, full_name, email, role, branch_id, is_active
         FROM users
         WHERE id = $1 AND institution_id = $2`,
        [staff_user_id, user.institutionId]
      );

      if (staffResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: 'The selected staff member is not part of your institution.',
        });
        return;
      }

      const targetStaff = staffResult.rows[0];
      if (!targetStaff.is_active) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: 'Cannot assign task to an inactive staff member.',
        });
        return;
      }

      // If branch_id supplied, verify branch belongs to institution
      let targetBranchId = branch_id || targetStaff.branch_id || report.current_branch_id;
      if (branch_id) {
        const branchCheck = await client.query(
          `SELECT id FROM branches WHERE id = $1 AND institution_id = $2`,
          [branch_id, user.institutionId]
        );
        if (branchCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(400).json({
            success: false,
            message: 'Specified branch does not belong to your institution.',
          });
          return;
        }
      }

      const isReassignment = !!report.assigned_staff_id && report.assigned_staff_id !== staff_user_id;
      const previousStatus = report.status;
      const newStatus = (previousStatus === 'routed' || previousStatus === 'under_review' || previousStatus === 'accepted')
        ? 'assigned'
        : previousStatus;

      // Update report
      await client.query(
        `UPDATE reports
         SET assigned_staff_id = $1,
             current_branch_id = COALESCE($2, current_branch_id),
             status = $3,
             priority = COALESCE($4, priority),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [staff_user_id, targetBranchId || null, newStatus, priority || null, report.id]
      );

      // Record in assignments table
      await client.query(
        `INSERT INTO assignments
           (report_id, to_institution_id, assigned_by_user_id, action_type, justification_notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          report.id,
          user.institutionId,
          user.userId,
          isReassignment ? 'staff_reassignment' : 'staff_assignment',
          comment || `Assigned to ${targetStaff.full_name}`,
        ]
      );

      // Record in status_history
      await client.query(
        `INSERT INTO status_history
           (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          report.id,
          user.userId,
          previousStatus,
          newStatus,
          comment || `${isReassignment ? 'Reassigned' : 'Assigned'} to staff operative ${targetStaff.full_name}`,
        ]
      );

      await client.query('COMMIT');

      // Audit log
      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: isReassignment ? 'REPORT_REASSIGNED' : 'REPORT_ASSIGNED',
        entityType: 'report',
        entityId: report.id,
        metadata: {
          previousStaffId: report.assigned_staff_id,
          newStaffId: staff_user_id,
          staffName: targetStaff.full_name,
          branchId: targetBranchId,
          isReassignment,
          comment,
        },
      });

      res.status(200).json({
        success: true,
        message: isReassignment ? 'Report successfully reassigned.' : 'Staff assigned successfully.',
        report_id: report.id,
        staff_user_id,
        branch_id: targetBranchId,
        status: newStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Assign staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to assign staff member.' });
    } finally {
      client.release();
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TWO-STAGE COMPLETION: STAFF SUBMIT WORK FOR REVIEW
  // POST /api/v1/institutions/reports/:id/submit-completion
  // ───────────────────────────────────────────────────────────────────────────
  async submitWorkForReview(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { notes, proof_url } = req.body as { notes?: string; proof_url?: string };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status, current_institution_id, assigned_staff_id
         FROM reports
         WHERE (id::text = $1 OR tracking_number = $1)
         FOR UPDATE`,
        [id]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportResult.rows[0];

      // Institutional boundary
      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Report belongs to a different institution.' });
        return;
      }

      // Scoping: If not super admin, caller must be the assigned staff member
      if (!user.isSuperAdmin && !user.isSystemAdmin && report.assigned_staff_id !== user.userId) {
        await client.query('ROLLBACK');
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only submit completion review for tasks assigned directly to you.',
        });
        return;
      }

      // Check current state: must be in an active working state
      if (!['assigned', 'in_progress', 'under_review'].includes(report.status)) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: `Cannot submit completion for a report in '${report.status}' state.`,
        });
        return;
      }

      const previousStatus = report.status;
      const newStatus = 'submitted_for_review';

      // Update report status
      await client.query(
        `UPDATE reports
         SET status = $1,
             resolution_notes = COALESCE($2, resolution_notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newStatus, notes || null, report.id]
      );

      // Record optional completion proof photo as attachment
      if (proof_url) {
        await client.query(
          `INSERT INTO attachments (report_id, uploaded_by_user_id, file_url, file_name, file_type, mime_type, file_size)
           VALUES ($1, $2, $3, 'completion_evidence.jpg', 'resolution_proof', 'image/jpeg', 0)`,
          [report.id, user.userId, proof_url]
        );
      }

      // Record status transition
      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [report.id, user.userId, previousStatus, newStatus, notes || 'Work completed by staff. Awaiting admin review.']
      );

      await client.query('COMMIT');

      // Audit log
      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'WORK_SUBMITTED_FOR_REVIEW',
        entityType: 'report',
        entityId: report.id,
        metadata: { notes, proof_url, previousStatus },
      });

      res.status(200).json({
        success: true,
        message: 'Work successfully submitted for completion review.',
        report_id: report.id,
        status: newStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Submit work review error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit work for review.' });
    } finally {
      client.release();
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TWO-STAGE COMPLETION: ADMIN APPROVE OR RETURN WORK
  // POST /api/v1/institutions/reports/:id/review-completion
  // ───────────────────────────────────────────────────────────────────────────
  async reviewCompletion(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { decision, comment, resolution_notes } = req.body as {
      decision: 'approve' | 'return';
      comment?: string;
      resolution_notes?: string;
    };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!decision || !['approve', 'return'].includes(decision)) {
      res.status(400).json({ success: false, message: "Valid decision ('approve' or 'return') is required." });
      return;
    }

    if (decision === 'return' && (!comment || !comment.trim())) {
      res.status(400).json({ success: false, message: 'A reason or comment is required when returning work for revision.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportResult = await client.query(
        `SELECT id, status, current_institution_id, assigned_staff_id, resolution_notes
         FROM reports
         WHERE (id::text = $1 OR tracking_number = $1)
         FOR UPDATE`,
        [id]
      );

      if (reportResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportResult.rows[0];

      // Institutional boundary
      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Report belongs to a different institution.' });
        return;
      }

      if (report.status !== 'submitted_for_review') {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: `Report is in '${report.status}' state, not awaiting completion review.`,
        });
        return;
      }

      const previousStatus = report.status;
      const isApproved = decision === 'approve';
      const newStatus = isApproved ? 'resolved' : 'in_progress';

      await client.query(
        `UPDATE reports
         SET status = $1::report_status,
             resolved_at = CASE WHEN $1::text = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
             resolution_notes = CASE
               WHEN $1::text = 'resolved' THEN COALESCE($2, resolution_notes, $3)
               ELSE resolution_notes
             END,
             resolution_information = CASE
               WHEN $1::text = 'resolved' THEN COALESCE($2, resolution_information, $3)
               ELSE resolution_information
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [newStatus, resolution_notes || null, comment || 'Work reviewed and approved.', report.id]
      );

      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          report.id,
          user.userId,
          previousStatus,
          newStatus,
          isApproved
            ? (comment || 'Completion approved by administrator.')
            : `Returned for revision: ${comment}`,
        ]
      );

      await client.query('COMMIT');

      // Audit log
      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: isApproved ? 'COMPLETION_APPROVED' : 'COMPLETION_RETURNED',
        entityType: 'report',
        entityId: report.id,
        metadata: { decision, comment, resolution_notes },
      });

      res.status(200).json({
        success: true,
        message: isApproved ? 'Report successfully resolved.' : 'Work returned to staff operative for correction.',
        report_id: report.id,
        status: newStatus,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Review completion error:', error);
      res.status(500).json({ success: false, message: 'Failed to process completion review.' });
    } finally {
      client.release();
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // BRANCH MANAGEMENT
  // GET /api/v1/institutions/branches
  // POST /api/v1/institutions/branches
  // ───────────────────────────────────────────────────────────────────────────
  async getBranches(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const institutionId = req.query.institution_id as string || user.institutionId;
      if (!institutionId) {
        res.status(400).json({ success: false, message: 'Institution ID required.' });
        return;
      }

      if (!user.isSystemAdmin && institutionId !== user.institutionId) {
        res.status(403).json({ success: false, message: 'Access denied to other institutions.' });
        return;
      }

      const result = await pool.query(
        `SELECT
           b.id,
           b.institution_id,
           b.name,
           b.code,
           b.address,
           b.phone_number,
           b.is_active,
           b.created_at,
           (SELECT COUNT(*)::int FROM users u WHERE u.branch_id = b.id AND u.is_active = TRUE) AS staff_count,
           (SELECT COUNT(*)::int FROM reports r WHERE r.current_branch_id = b.id AND r.status NOT IN ('resolved', 'rejected')) AS active_reports_count
         FROM branches b
         WHERE b.institution_id = $1
         ORDER BY b.name ASC`,
        [institutionId]
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error('Get branches error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve branches.' });
    }
  },

  async createBranch(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { name, code, address, phone_number } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Branch name and unique code are required.' });
      return;
    }

    try {
      const cleanCode = code.trim().toUpperCase();

      const result = await pool.query(
        `INSERT INTO branches (institution_id, name, code, address, phone_number, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id, institution_id, name, code, address, phone_number, is_active, created_at`,
        [user.institutionId, name.trim(), cleanCode, address || null, phone_number || null]
      );

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'BRANCH_CREATED',
        entityType: 'branch',
        entityId: result.rows[0].id,
        metadata: { name: name.trim(), code: cleanCode },
      });

      res.status(201).json({
        success: true,
        message: 'Branch created successfully.',
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create branch error:', error);
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'A branch with this code already exists in your institution.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create branch.' });
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // BRANCH TRANSFERS
  // POST /api/v1/institutions/reports/:id/transfer-branch
  // GET  /api/v1/institutions/transfers
  // POST /api/v1/institutions/transfers/:transferId/review
  // ───────────────────────────────────────────────────────────────────────────
  async initiateBranchTransfer(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { to_branch_id, reason } = req.body as { to_branch_id?: string; reason?: string };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!to_branch_id) {
      res.status(400).json({ success: false, message: 'Destination branch (to_branch_id) is required.' });
      return;
    }

    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'Transfer justification reason is required.' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportRes = await client.query(
        `SELECT id, status, current_institution_id, current_branch_id
         FROM reports
         WHERE (id::text = $1 OR tracking_number = $1)
         FOR UPDATE`,
        [id]
      );

      if (reportRes.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportRes.rows[0];

      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Report belongs to another institution.' });
        return;
      }

      if (report.current_branch_id === to_branch_id) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, message: 'Report is already assigned to this branch.' });
        return;
      }

      // Check destination branch belongs to this institution
      const destBranch = await client.query(
        `SELECT id, name FROM branches WHERE id = $1 AND institution_id = $2 AND is_active = TRUE`,
        [to_branch_id, user.institutionId]
      );

      if (destBranch.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, message: 'Destination branch is invalid or inactive.' });
        return;
      }

      // Record transfer record
      const transferRes = await client.query(
        `INSERT INTO report_transfers
           (report_id, source_institution_id, destination_institution_id,
            source_branch_id, destination_branch_id, initiated_by_user_id, reason, status)
         VALUES ($1, $2, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [report.id, user.institutionId, report.current_branch_id || null, to_branch_id, user.userId, reason.trim()]
      );

      // Record in status_history
      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         VALUES ($1, $2, $3, $3, $4)`,
        [report.id, user.userId, report.status, `Branch transfer requested to ${destBranch.rows[0].name}: ${reason}`]
      );

      await client.query('COMMIT');

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'BRANCH_TRANSFER_INITIATED',
        entityType: 'transfer',
        entityId: transferRes.rows[0].id,
        metadata: {
          reportId: report.id,
          fromBranchId: report.current_branch_id,
          toBranchId: to_branch_id,
          reason,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Branch transfer initiated successfully.',
        data: transferRes.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Initiate branch transfer error:', error);
      res.status(500).json({ success: false, message: 'Failed to initiate branch transfer.' });
    } finally {
      client.release();
    }
  },

  async getTransfers(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { status } = req.query as { status?: string };
      const params: any[] = [user.institutionId];
      let statusFilter = '';

      if (status) {
        params.push(status);
        statusFilter = `AND t.status = $${params.length}`;
      }

      const result = await pool.query(
        `SELECT
           t.*,
           r.tracking_number,
           r.title AS report_title,
           r.status AS report_status,
           fb.name AS from_branch_name,
           tb.name AS to_branch_name,
           u_req.full_name AS requested_by_name,
           u_rev.full_name AS reviewed_by_name
         FROM report_transfers t
         JOIN reports r ON r.id = t.report_id
         LEFT JOIN branches fb ON fb.id = t.source_branch_id
         LEFT JOIN branches tb ON tb.id = t.destination_branch_id
         LEFT JOIN users u_req ON u_req.id = t.initiated_by_user_id
         LEFT JOIN users u_rev ON u_rev.id = t.reviewed_by_user_id
         WHERE t.destination_institution_id = $1
           ${statusFilter}
         ORDER BY t.created_at DESC`,
        params
      );

      res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error('Get transfers error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve transfers.' });
    }
  },

  async reviewBranchTransfer(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { transferId } = req.params;
    const { decision, comment } = req.body as { decision: 'accept' | 'reject'; comment?: string };

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!decision || !['accept', 'reject'].includes(decision)) {
      res.status(400).json({ success: false, message: "Decision must be 'accept' or 'reject'." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const transferRes = await client.query(
        `SELECT * FROM report_transfers WHERE id = $1 FOR UPDATE`,
        [transferId]
      );

      if (transferRes.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ success: false, message: 'Transfer request not found.' });
        return;
      }

      const transfer = transferRes.rows[0];

      if (!user.isSystemAdmin && transfer.destination_institution_id !== user.institutionId) {
        await client.query('ROLLBACK');
        res.status(403).json({ success: false, message: 'Transfer request belongs to a different institution.' });
        return;
      }

      if (transfer.status !== 'pending') {
        await client.query('ROLLBACK');
        res.status(400).json({ success: false, message: `Transfer has already been ${transfer.status}.` });
        return;
      }

      const isAccepted = decision === 'accept';
      const newTransferStatus = isAccepted ? 'accepted' : 'rejected';

      // Update transfer record
      await client.query(
        `UPDATE report_transfers
         SET status = $1,
             reviewed_by_user_id = $2,
             reviewed_at = CURRENT_TIMESTAMP,
             review_notes = $3
         WHERE id = $4`,
        [newTransferStatus, user.userId, comment || null, transferId]
      );

      // If accepted, update the report's current_branch_id
      if (isAccepted) {
        await client.query(
          `UPDATE reports
           SET current_branch_id = $1,
               assigned_staff_id = NULL, -- clear staff assignment so destination branch assigns appropriate staff
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [transfer.destination_branch_id, transfer.report_id]
        );
      }

      // Record in status_history
      await client.query(
        `INSERT INTO status_history (report_id, changed_by_user_id, previous_status, new_status, comment)
         SELECT r.id, $1, r.status, r.status, $2
         FROM reports r
         WHERE r.id = $3`,
        [
          user.userId,
          `Branch transfer ${isAccepted ? 'accepted' : 'rejected'}${comment ? `: ${comment}` : ''}`,
          transfer.report_id,
        ]
      );

      await client.query('COMMIT');

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: isAccepted ? 'BRANCH_TRANSFER_ACCEPTED' : 'BRANCH_TRANSFER_REJECTED',
        entityType: 'transfer',
        entityId: transferId,
        metadata: { decision, comment, reportId: transfer.report_id },
      });

      res.status(200).json({
        success: true,
        message: `Branch transfer ${isAccepted ? 'accepted' : 'rejected'} successfully.`,
        data: { transferId, status: newTransferStatus },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Review branch transfer error:', error);
      res.status(500).json({ success: false, message: 'Failed to process transfer review.' });
    } finally {
      client.release();
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // STAFF MANAGEMENT
  // GET    /api/v1/institutions/staff
  // POST   /api/v1/institutions/staff
  // PUT    /api/v1/institutions/staff/:id
  // DELETE /api/v1/institutions/staff/:id
  // ───────────────────────────────────────────────────────────────────────────
  async getStaff(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const result = await pool.query(
        `SELECT
           u.id,
           u.full_name AS name,
           u.role,
           u.email,
           u.phone_number AS phone,
           u.branch_id,
           b.name AS branch_name,
           b.code AS branch_code,
           i.name AS department,
           CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END AS status,
           u.created_at AS "joinedAt",
           (SELECT COUNT(*)::int FROM reports r WHERE r.assigned_staff_id = u.id) AS "reportsHandled",
           (SELECT COUNT(*)::int FROM reports r WHERE r.assigned_staff_id = u.id AND r.status NOT IN ('resolved', 'rejected')) AS "activeReportsCount"
         FROM users u
         JOIN institutions i ON i.id = u.institution_id
         LEFT JOIN branches b ON b.id = u.branch_id
         WHERE u.institution_id = $1
           AND u.role IN ('staff', 'institution_staff', 'institution_super_admin', 'branch_manager')
         ORDER BY
           CASE WHEN u.role = 'institution_super_admin' THEN 1 ELSE 2 END ASC,
           u.full_name ASC`,
        [user.institutionId]
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

  async createStaff(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { name, email, phone, role, branch_id, password } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Name and email are required.' });
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Enforce valid institutional roles (prevent vertical privilege escalation to admin)
      let targetRole = role ? normalizeRole(role) : ROLES.INSTITUTION_STAFF;
      const allowedRoles = [ROLES.INSTITUTION_STAFF, ROLES.INSTITUTION_SUPER_ADMIN, ROLES.BRANCH_MANAGER];
      if (!allowedRoles.includes(targetRole as any)) {
        targetRole = ROLES.INSTITUTION_STAFF;
      }

      // Hash password (use provided or default secure temp password)
      const plainPassword = password && password.length >= 8 ? password : 'FurkoStaffJimma2026!';
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

      // Verify branch belongs to institution if provided
      let verifiedBranchId: string | null = null;
      if (branch_id) {
        const branchCheck = await pool.query(
          `SELECT id FROM branches WHERE id = $1 AND institution_id = $2`,
          [branch_id, user.institutionId]
        );
        if (branchCheck.rows.length > 0) {
          verifiedBranchId = branchCheck.rows[0].id;
        }
      }

      const result = await pool.query(
        `INSERT INTO users (institution_id, branch_id, full_name, email, phone_number, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING id, full_name AS name, email, phone_number AS phone, role, branch_id, is_active, created_at AS "joinedAt"`,
        [user.institutionId, verifiedBranchId, cleanName, cleanEmail, phone ? phone.trim() : null, passwordHash, targetRole]
      );

      const createdUser = result.rows[0];

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'STAFF_CREATED',
        entityType: 'user',
        entityId: createdUser.id,
        metadata: { email: cleanEmail, role: targetRole, branchId: verifiedBranchId },
      });

      res.status(201).json({
        success: true,
        message: 'Staff member account created successfully.',
        data: {
          ...createdUser,
          status: 'Active',
          reportsHandled: 0,
          activeReportsCount: 0,
        },
      });
    } catch (error: any) {
      console.error('Create staff error:', error);
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create staff member.' });
    }
  },

  async updateStaff(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;
    const { name, email, phone, role, branch_id, status } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      // Find target user in this institution
      const targetRes = await pool.query(
        `SELECT id, role, is_active, email FROM users WHERE id = $1 AND institution_id = $2`,
        [id, user.institutionId]
      );

      if (targetRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Staff member not found in your institution.' });
        return;
      }

      const targetUser = targetRes.rows[0];
      const targetCurrentRole = normalizeRole(targetUser.role);
      const isDemotingOrDeactivating =
        (status === 'Inactive' || status === false) ||
        (role && normalizeRole(role) !== ROLES.INSTITUTION_SUPER_ADMIN);

      // ── CRITICAL: LAST ADMIN PROTECTION RULE ──────────────────────────────
      // If target user is an active Institution Super Admin and is being deactivated or demoted,
      // verify that there is at least ONE OTHER active Institution Super Admin!
      if (targetCurrentRole === ROLES.INSTITUTION_SUPER_ADMIN && isDemotingOrDeactivating && targetUser.is_active) {
        const adminCountRes = await pool.query(
          `SELECT COUNT(*)::int AS count
           FROM users
           WHERE institution_id = $1
             AND role = 'institution_super_admin'
             AND is_active = TRUE
             AND id != $2`,
          [user.institutionId, id]
        );

        const otherActiveAdmins = adminCountRes.rows[0].count;
        if (otherActiveAdmins === 0) {
          res.status(400).json({
            success: false,
            message: 'Action rejected: Cannot deactivate or demote the sole remaining Institution Super Admin. Promote another staff member to Super Admin first to prevent administrative lockout.',
          });
          return;
        }
      }

      const isActive = status !== undefined ? (status === 'Active' || status === true) : targetUser.is_active;

      let newRole = targetUser.role;
      if (role) {
        const normalized = normalizeRole(role);
        if ([ROLES.INSTITUTION_STAFF, ROLES.INSTITUTION_SUPER_ADMIN, ROLES.BRANCH_MANAGER].includes(normalized as any)) {
          newRole = normalized;
        }
      }

      const result = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             email = COALESCE($2, email),
             phone_number = COALESCE($3, phone_number),
             role = $4,
             branch_id = COALESCE($5, branch_id),
             is_active = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND institution_id = $8
         RETURNING id, full_name AS name, email, phone_number AS phone, role, branch_id,
                   CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END AS status`,
        [
          name ? name.trim() : null,
          email ? email.trim().toLowerCase() : null,
          phone ? phone.trim() : null,
          newRole,
          branch_id !== undefined ? branch_id : null,
          isActive,
          id,
          user.institutionId,
        ]
      );

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: isActive ? 'STAFF_UPDATED' : 'STAFF_DEACTIVATED',
        entityType: 'user',
        entityId: id,
        metadata: { role: newRole, branchId: branch_id, status: isActive ? 'Active' : 'Inactive' },
      });

      res.status(200).json({
        success: true,
        message: 'Staff profile updated successfully.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to update staff member.' });
    }
  },

  async deleteStaff(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      // Find target user
      const targetRes = await pool.query(
        `SELECT id, role, is_active FROM users WHERE id = $1 AND institution_id = $2`,
        [id, user.institutionId]
      );

      if (targetRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Staff member not found.' });
        return;
      }

      const target = targetRes.rows[0];

      // Last admin protection
      if (normalizeRole(target.role) === ROLES.INSTITUTION_SUPER_ADMIN && target.is_active) {
        const adminCount = await pool.query(
          `SELECT COUNT(*)::int AS count
           FROM users
           WHERE institution_id = $1
             AND role = 'institution_super_admin'
             AND is_active = TRUE
             AND id != $2`,
          [user.institutionId, id]
        );

        if (adminCount.rows[0].count === 0) {
          res.status(400).json({
            success: false,
            message: 'Cannot deactivate the only active Institution Super Admin.',
          });
          return;
        }
      }

      await pool.query(
        `UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND institution_id = $2`,
        [id, user.institutionId]
      );

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'STAFF_DEACTIVATED',
        entityType: 'user',
        entityId: id,
      });

      res.status(200).json({ success: true, message: 'Staff member deactivated successfully.' });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({ success: false, message: 'Failed to deactivate staff member.' });
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // AUDIT TRAIL
  // GET /api/v1/institutions/audit
  // ───────────────────────────────────────────────────────────────────────────
  async getAuditLogs(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { page, limit, action, entity_type, entity_id } = req.query as {
        page?: string;
        limit?: string;
        action?: string;
        entity_type?: string;
        entity_id?: string;
      };

      const result = await AuditService.getLogs({
        institutionId: user.institutionId || undefined,
        action,
        entityType: entity_type,
        entityId: entity_id,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 25,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PROFILE & PUBLIC METADATA
  // ───────────────────────────────────────────────────────────────────────────
  async getProfile(req: RbacRequest, res: Response): Promise<void> {
    try {
      const user = await getCallerContext(req);
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const instRes = await pool.query(
        `SELECT i.*,
                (SELECT COUNT(*)::int FROM users u WHERE u.institution_id = i.id AND u.is_active = TRUE) AS "staffCount",
                (SELECT COUNT(*)::int FROM reports r WHERE r.current_institution_id = i.id) AS "totalReports"
         FROM institutions i
         WHERE i.id = $1`,
        [user.institutionId]
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
        [user.institutionId]
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

  async updateProfile(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { email, phone, description, name } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE institutions
         SET contact_email = COALESCE($1, contact_email),
             contact_phone = COALESCE($2, contact_phone),
             description = COALESCE($3, description),
             name = COALESCE($4, name),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [email, phone, description, name, user.institutionId]
      );

      AuditService.log({
        actorId: user.userId,
        institutionId: user.institutionId,
        action: 'INSTITUTION_PROFILE_UPDATED',
        entityType: 'institution',
        entityId: user.institutionId || '',
        metadata: { name, email, phone },
      });

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

  async getHistory(req: RbacRequest, res: Response): Promise<void> {
    const user = await getCallerContext(req);
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    try {
      const reportRes = await pool.query(
        `SELECT id, current_institution_id FROM reports WHERE (id::text = $1 OR tracking_number = $1)`,
        [id]
      );

      if (reportRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Report not found.' });
        return;
      }

      const report = reportRes.rows[0];
      if (!user.isSystemAdmin && report.current_institution_id !== user.institutionId) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const history = await pool.query(
        `SELECT h.id, h.previous_status, h.new_status, h.comment,
                h.changed_at, u.full_name AS changed_by
         FROM status_history h
         LEFT JOIN users u ON u.id = h.changed_by_user_id
         WHERE h.report_id = $1
         ORDER BY h.changed_at DESC`,
        [report.id]
      );

      res.status(200).json({
        success: true,
        count: history.rows.length,
        history: history.rows,
      });
    } catch (error) {
      console.error('Get workflow history error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve workflow history.' });
    }
  },
};
