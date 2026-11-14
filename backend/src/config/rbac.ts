// ─────────────────────────────────────────────────────────────────────────────
// FURKO — Role-Based Access Control (RBAC) Architecture
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'admin'                    // System Administrator
  | 'institution_super_admin'  // Primary / Backup Institution Administrator
  | 'branch_manager'           // Optional Branch Operational Manager
  | 'institution_staff'        // Field Inspector / Operative / Staff
  | 'staff'                    // Legacy alias for institution_staff
  | 'citizen';                 // Public Citizen Reporter

export const ROLES = {
  SYSTEM_ADMIN: 'admin' as const,
  INSTITUTION_SUPER_ADMIN: 'institution_super_admin' as const,
  BRANCH_MANAGER: 'branch_manager' as const,
  INSTITUTION_STAFF: 'institution_staff' as const,
  STAFF_LEGACY: 'staff' as const,
  CITIZEN: 'citizen' as const,
};

export const PERMISSIONS = {
  // Institutions
  INSTITUTIONS_VIEW: 'institutions.view',
  INSTITUTIONS_MANAGE: 'institutions.manage',

  // Staff Management
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DEACTIVATE: 'staff.deactivate',
  ROLES_VIEW: 'roles.view',
  ROLES_ASSIGN: 'roles.assign',

  // Branches
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_MANAGE: 'branches.manage',

  // Reports — Scopes & Actions
  REPORTS_VIEW_INSTITUTION: 'reports.view_institution',
  REPORTS_VIEW_BRANCH: 'reports.view_branch',
  REPORTS_VIEW_ASSIGNED: 'reports.view_assigned',
  REPORTS_REVIEW_INCOMING: 'reports.review_incoming',
  REPORTS_ASSIGN_STAFF: 'reports.assign_staff',
  REPORTS_REASSIGN_STAFF: 'reports.reassign_staff',
  REPORTS_TRANSFER_BRANCH: 'reports.transfer_branch',
  REPORTS_REQUEST_INSTITUTION_TRANSFER: 'reports.request_institution_transfer',
  REPORTS_UPDATE_PROGRESS: 'reports.update_progress',
  REPORTS_UPLOAD_EVIDENCE: 'reports.upload_evidence',
  REPORTS_SUBMIT_COMPLETION: 'reports.submit_completion',
  REPORTS_REVIEW_COMPLETION: 'reports.review_completion',
  REPORTS_RESOLVE: 'reports.resolve',
  REPORTS_REOPEN: 'reports.reopen',
  REPORTS_VIEW_AUDIT: 'reports.view_audit',

  // Routing
  ROUTING_MANAGE: 'routing.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to Permission Mappings
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.SYSTEM_ADMIN]: [
    PERMISSIONS.INSTITUTIONS_VIEW,
    PERMISSIONS.INSTITUTIONS_MANAGE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DEACTIVATE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_ASSIGN,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.BRANCHES_MANAGE,
    PERMISSIONS.REPORTS_VIEW_INSTITUTION,
    PERMISSIONS.REPORTS_VIEW_BRANCH,
    PERMISSIONS.REPORTS_VIEW_ASSIGNED,
    PERMISSIONS.REPORTS_REVIEW_INCOMING,
    PERMISSIONS.REPORTS_ASSIGN_STAFF,
    PERMISSIONS.REPORTS_REASSIGN_STAFF,
    PERMISSIONS.REPORTS_TRANSFER_BRANCH,
    PERMISSIONS.REPORTS_REQUEST_INSTITUTION_TRANSFER,
    PERMISSIONS.REPORTS_UPDATE_PROGRESS,
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_SUBMIT_COMPLETION,
    PERMISSIONS.REPORTS_REVIEW_COMPLETION,
    PERMISSIONS.REPORTS_RESOLVE,
    PERMISSIONS.REPORTS_REOPEN,
    PERMISSIONS.REPORTS_VIEW_AUDIT,
    PERMISSIONS.ROUTING_MANAGE,
  ],

  [ROLES.INSTITUTION_SUPER_ADMIN]: [
    PERMISSIONS.INSTITUTIONS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DEACTIVATE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_ASSIGN,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.BRANCHES_MANAGE,
    PERMISSIONS.REPORTS_VIEW_INSTITUTION,
    PERMISSIONS.REPORTS_VIEW_BRANCH,
    PERMISSIONS.REPORTS_VIEW_ASSIGNED,
    PERMISSIONS.REPORTS_REVIEW_INCOMING,
    PERMISSIONS.REPORTS_ASSIGN_STAFF,
    PERMISSIONS.REPORTS_REASSIGN_STAFF,
    PERMISSIONS.REPORTS_TRANSFER_BRANCH,
    PERMISSIONS.REPORTS_REQUEST_INSTITUTION_TRANSFER,
    PERMISSIONS.REPORTS_UPDATE_PROGRESS,
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_REVIEW_COMPLETION,
    PERMISSIONS.REPORTS_RESOLVE,
    PERMISSIONS.REPORTS_VIEW_AUDIT,
  ],

  [ROLES.BRANCH_MANAGER]: [
    PERMISSIONS.INSTITUTIONS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.REPORTS_VIEW_BRANCH,
    PERMISSIONS.REPORTS_VIEW_ASSIGNED,
    PERMISSIONS.REPORTS_ASSIGN_STAFF,
    PERMISSIONS.REPORTS_REASSIGN_STAFF,
    PERMISSIONS.REPORTS_TRANSFER_BRANCH,
    PERMISSIONS.REPORTS_UPDATE_PROGRESS,
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_REVIEW_COMPLETION,
    PERMISSIONS.REPORTS_VIEW_AUDIT,
  ],

  [ROLES.INSTITUTION_STAFF]: [
    PERMISSIONS.INSTITUTIONS_VIEW,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.REPORTS_VIEW_ASSIGNED,
    PERMISSIONS.REPORTS_UPDATE_PROGRESS,
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_SUBMIT_COMPLETION,
  ],

  // Backward compatibility alias for legacy 'staff' role
  [ROLES.STAFF_LEGACY]: [
    PERMISSIONS.INSTITUTIONS_VIEW,
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.REPORTS_VIEW_ASSIGNED,
    PERMISSIONS.REPORTS_UPDATE_PROGRESS,
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_SUBMIT_COMPLETION,
  ],

  [ROLES.CITIZEN]: [
    PERMISSIONS.REPORTS_UPLOAD_EVIDENCE,
    PERMISSIONS.REPORTS_REOPEN,
  ],
};

/**
 * Returns all permissions associated with a given role.
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Checks whether a given role possesses a specific permission.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = getPermissionsForRole(role);
  return perms.includes(permission);
}

/**
 * Checks whether a user role is an administrative role in an institution.
 */
export function isInstitutionAdmin(role: string): boolean {
  return role === ROLES.SYSTEM_ADMIN || role === ROLES.INSTITUTION_SUPER_ADMIN;
}

/**
 * Normalizes user role string to standard canonical representation.
 */
export function normalizeRole(role?: string): string {
  if (!role) return ROLES.CITIZEN;
  const lower = role.toLowerCase().trim();
  if (lower === 'admin' || lower === 'system_admin') return ROLES.SYSTEM_ADMIN;
  if (lower === 'institution_super_admin' || lower === 'super_admin' || lower === 'administrator') {
    return ROLES.INSTITUTION_SUPER_ADMIN;
  }
  if (lower === 'branch_manager') return ROLES.BRANCH_MANAGER;
  if (lower === 'staff' || lower === 'institution_staff') return ROLES.INSTITUTION_STAFF;
  return ROLES.CITIZEN;
}
