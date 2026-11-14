// ─────────────────────────────────────────────────────────────────────────────
// FURKO — RBAC & Institutional Scoping Middleware
// ─────────────────────────────────────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import pool from '../config/db';
import { AuthenticatedRequest } from './authMiddleware';
import { Permission, getPermissionsForRole, normalizeRole, ROLES } from '../config/rbac';

export interface UserContext {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  permissions: Permission[];
  institutionId: string | null;
  branchId: string | null;
  isSystemAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
}

export interface RbacRequest extends AuthenticatedRequest {
  userContext?: UserContext;
}

/**
 * Loads full user context from database and verifies account & institution activity.
 */
export async function resolveUserContext(userId: string): Promise<UserContext | null> {
  const result = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.institution_id, u.branch_id,
            COALESCE(i.is_active, TRUE) AS institution_active
     FROM users u
     LEFT JOIN institutions i ON i.id = u.institution_id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  if (!row.is_active || !row.institution_active) {
    return null;
  }

  const role = normalizeRole(row.role);
  const permissions = getPermissionsForRole(role);

  return {
    userId: row.id,
    email: row.email,
    fullName: row.full_name,
    role,
    permissions,
    institutionId: row.institution_id || null,
    branchId: row.branch_id || null,
    isSystemAdmin: role === ROLES.SYSTEM_ADMIN,
    isSuperAdmin: role === ROLES.INSTITUTION_SUPER_ADMIN,
    isStaff: role === ROLES.INSTITUTION_STAFF || role === ROLES.STAFF_LEGACY,
  };
}

/**
 * Middleware factory requiring user to possess specified permission(s).
 * Enforces server-side least privilege and institutional isolation.
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return async (req: RbacRequest, res: Response, next: NextFunction): Promise<void> => {
    const tokenUserId = req.user?.userId;
    if (!tokenUserId) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.', statusCode: 401 },
      });
      return;
    }

    try {
      const context = await resolveUserContext(tokenUserId);
      if (!context) {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Account is inactive or disabled.', statusCode: 403 },
        });
        return;
      }

      req.userContext = context;

      // System administrator bypasses institutional granular restrictions
      if (context.isSystemAdmin) {
        next();
        return;
      }

      // Check if user has all required permissions
      const hasAll = requiredPermissions.every((p) => context.permissions.includes(p));
      if (!hasAll) {
        res.status(403).json({
          success: false,
          error: {
            message: 'Access denied. You do not possess the required permission for this operation.',
            requiredPermissions,
            statusCode: 403,
          },
        });
        return;
      }

      // If an institution scope is provided in params or body, verify membership
      const targetInstitutionId = req.params.institutionId || req.body?.institutionId;
      if (targetInstitutionId && targetInstitutionId !== context.institutionId) {
        res.status(403).json({
          success: false,
          error: { message: 'Cross-institution access denied.', statusCode: 403 },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[RbacMiddleware] Error verifying authorization:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Internal authorization verification error.', statusCode: 500 },
      });
    }
  };
}

/**
 * Requires the user to be an active Institution Super Admin or System Admin.
 */
export function requireInstitutionAdmin(req: RbacRequest, res: Response, next: NextFunction): void {
  requirePermission(
    // Minimum admin permission required
    'staff.view' as Permission
  )(req, res, () => {
    if (req.userContext?.isSystemAdmin || req.userContext?.isSuperAdmin) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: { message: 'Action restricted to Institution Administrators.', statusCode: 403 },
      });
    }
  });
}
