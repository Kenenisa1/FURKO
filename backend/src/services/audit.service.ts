// ─────────────────────────────────────────────────────────────────────────────
// FURKO — Audit Logging Service
// ─────────────────────────────────────────────────────────────────────────────

import pool from '../config/db';

export interface AuditLogEntry {
  actorId?: string | null;
  institutionId?: string | null;
  branchId?: string | null;
  action: string;
  entityType: 'report' | 'user' | 'branch' | 'institution' | 'transfer' | string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

export class AuditService {
  /**
   * Records a security-critical or operational event in audit_logs.
   * Never throws or interrupts the parent transaction.
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const sanitizedMeta = { ...entry.metadata };
      // Never store sensitive credentials in audit logs
      delete sanitizedMeta.password;
      delete sanitizedMeta.password_hash;
      delete sanitizedMeta.token;
      delete sanitizedMeta.verification_code;

      await pool.query(
        `INSERT INTO audit_logs (
           actor_id, institution_id, branch_id, action, entity_type, entity_id, metadata, ip_address
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          entry.actorId || null,
          entry.institutionId || null,
          entry.branchId || null,
          entry.action,
          entry.entityType,
          entry.entityId || null,
          JSON.stringify(sanitizedMeta),
          entry.ipAddress || null,
        ]
      );
    } catch (err) {
      // Non-fatal logging error
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }

  /**
   * Retrieves audit logs for an institution, optionally filtered by entity or action.
   */
  static async getLogs(params: {
    institutionId?: string | null;
    entityType?: string;
    entityId?: string;
    action?: string;
    page?: number;
    limit?: number;
    offset?: number;
  }) {
    const {
      institutionId,
      entityType,
      entityId,
      action,
      page = 1,
      limit = 25,
      offset = (page - 1) * limit,
    } = params;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (institutionId) {
      conditions.push(`a.institution_id = $${idx++}`);
      values.push(institutionId);
    }

    if (entityType) {
      conditions.push(`a.entity_type = $${idx++}`);
      values.push(entityType);
    }
    if (entityId) {
      conditions.push(`a.entity_id = $${idx++}`);
      values.push(entityId);
    }
    if (action) {
      conditions.push(`a.action = $${idx++}`);
      values.push(action);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM audit_logs a ${whereClause}`,
      values
    );

    const query = `
      SELECT
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.metadata,
        a.created_at,
        u.full_name AS actor_name,
        u.email AS actor_email,
        u.role AS actor_role,
        i.name AS institution_name,
        b.name AS branch_name
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.actor_id
      LEFT JOIN institutions i ON i.id = a.institution_id
      LEFT JOIN branches b ON b.id = a.branch_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    return {
      total: countRes.rows[0]?.total || 0,
      page,
      limit,
      logs: result.rows,
    };
  }
}
