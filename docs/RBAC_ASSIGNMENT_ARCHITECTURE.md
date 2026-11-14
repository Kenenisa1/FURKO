# FURKO — Institution RBAC, Staff Management, and Report Assignment Architecture

## 1. System Overview & Architectural Hierarchy

**FURKO — Report. Track. Resolve.** is a civic issue-reporting platform for Jimma, Ethiopia. Citizens report civic issues without needing to know bureaucratic divisions; the backend's spatial-category routing engine routes reports directly to the responsible municipal institution.

This architecture document specifies and documents the institution-side operational layer:
- **System Administrator (`admin`)**: Manages platform configuration, global routing rules, and institution records.
- **Institution Super Admin (`institution_super_admin`)**: Oversees institution operations, manages staff, approves work completion, assigns reports to branches and personnel, and reviews audit logs.
- **Branch Manager (`branch_manager`)**: Manages operations and workload scoped to a designated branch.
- **Institution Staff Operative (`institution_staff`)**: Inspects assigned tasks, performs repairs on site, updates progress, uploads photographic evidence, and submits completed work for review.
- **Citizen (`citizen`)**: Submits reports, tracks progress transparently, and confirms or reopens resolutions.

```
┌─────────────────────────────────────────────────────────────┐
│                       FURKO PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│ System Administrator                                        │
│   └── Platform Configuration, Institution Onboarding        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Institution (e.g., Jimma City Road Bureau)             │ │
│ │   ├── Institution Super Admin (Primary Administrator)   │ │
│ │   │     ├── Staff Management & Role Assignment          │ │
│ │   │     ├── Incoming Report Review & Branch Allocation  │ │
│ │   │     ├── Work Completion Review & Final Resolution   │ │
│ │   │     └── Audit Log Inspection                        │ │
│ │   │                                                     │ │
│ │   ├── Branches                                          │ │
│ │   │     ├── Central Headquarter (e.g., ROAD-CENTRAL)   │ │
│ │   │     └── Zone Branches (e.g., ROAD-GINJO)            │ │
│ │   │                                                     │ │
│ │   └── Institution Staff Operatives                      │ │
│ │         ├── View Assigned Tasks                         │ │
│ │         ├── In-Progress Execution & Evidence Upload     │ │
│ │         └── Submit Work for Admin Review                │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Granular Permissions & RBAC Model

Permission checks are enforced on every protected backend route via `requirePermission(...)` middleware ([rbacMiddleware.ts](file:///c:/Users/kenen/OneDrive/Documents/My_Projects/Furko/backend/src/middleware/rbacMiddleware.ts)). Hiding frontend UI buttons is never used as a sole security boundary.

| Permission | Description | System Admin | Super Admin | Branch Manager | Institution Staff |
|---|---|:---:|:---:|:---:|:---:|
| `institutions.view` | View institution profile & statistics | ✅ | ✅ | ✅ | ✅ |
| `institutions.manage` | Update institution details | ✅ | ✅ | ❌ | ❌ |
| `branches.view` | View branches within institution | ✅ | ✅ | ✅ | ✅ |
| `branches.manage` | Create & configure branches | ✅ | ✅ | ❌ | ❌ |
| `staff.view` | View staff members and task counts | ✅ | ✅ | ✅ | ❌ |
| `staff.create` | Provision new staff accounts | ✅ | ✅ | ❌ | ❌ |
| `staff.update` | Update staff roles and branches | ✅ | ✅ | ❌ | ❌ |
| `staff.deactivate` | Deactivate staff accounts | ✅ | ✅ | ❌ | ❌ |
| `roles.view` | Inspect role definitions & assignments | ✅ | ✅ | ❌ | ❌ |
| `roles.assign` | Assign roles to staff | ✅ | ✅ | ❌ | ❌ |
| `reports.view_institution` | View all reports in institution | ✅ | ✅ | ❌ | ❌ |
| `reports.view_branch` | View reports scoped to branch | ✅ | ✅ | ✅ | ❌ |
| `reports.view_assigned` | View reports assigned to user | ✅ | ✅ | ✅ | ✅ |
| `reports.review_incoming` | Review incoming unassigned tickets | ✅ | ✅ | ✅ | ❌ |
| `reports.assign_staff` | Assign / reassign operative | ✅ | ✅ | ✅ | ❌ |
| `reports.transfer_branch` | Initiate / review branch transfers | ✅ | ✅ | ✅ | ❌ |
| `reports.update_progress` | Update report progress notes | ✅ | ✅ | ✅ | ✅ |
| `reports.upload_evidence` | Upload repair evidence / proof | ✅ | ✅ | ✅ | ✅ |
| `reports.submit_completion`| Submit work for admin review | ✅ | ✅ | ✅ | ✅ |
| `reports.review_completion`| Approve or return submitted work | ✅ | ✅ | ❌ | ❌ |
| `reports.resolve` | Direct authoritative resolution | ✅ | ✅ | ❌ | ❌ |
| `reports.view_audit` | Inspect security & action audit logs | ✅ | ✅ | ❌ | ❌ |

---

## 3. Report Lifecycle & Two-Stage Completion Review

Reports transition through discrete, centrally validated lifecycle states:

```
[SUBMITTED]
    │
    ▼ (Automated spatial/category routing)
[ROUTED]
    │
    ▼ (Institution Super Admin accepts report)
[UNDER_REVIEW] / [ACCEPTED]
    │
    ├── (Admin initiates branch transfer) ──> [TRANSFER PENDING] ──> [ACCEPTED / REJECTED]
    │
    ▼ (Admin assigns staff operative & branch)
[ASSIGNED]
    │
    ▼ (Staff starts work on-site)
[IN_PROGRESS]
    │
    ▼ (Staff submits field notes & photographic proof)
[SUBMITTED_FOR_REVIEW]
    │
    ├── (Super Admin returns for correction with feedback) ──> [IN_PROGRESS]
    │
    ▼ (Super Admin approves completion)
[RESOLVED]
    │
    ├── (Citizen reopens within grace period) ──> [REOPENED] ──> [IN_PROGRESS]
    ▼ (Citizen confirms or auto-closes)
[CLOSED]
```

---

## 4. Security Safeguards & IDOR Prevention

1. **Institutional Isolation**: Every query filters by `current_institution_id = userContext.institutionId`. Cross-institution requests are denied with HTTP 403 Forbidden.
2. **Branch Scoping**: Branch users only view tickets assigned to their branch or allocated directly to them.
3. **Least Privilege**: Ordinary staff cannot access administrative endpoints, cannot promote themselves or others, and cannot directly mark tickets as resolved without Super Admin approval.
4. **Last Active Administrator Protection**: Attempting to deactivate or demote the sole remaining active `institution_super_admin` in an institution is rejected with HTTP 400 to prevent permanent administrative lockout.
5. **Sanitized Audit Trail**: All security-critical actions are recorded in `audit_logs` asynchronously. Passwords, hashes, and tokens are stripped before database persistence.

---

## 5. API Endpoints Reference

### Staff & RBAC Management
- `GET /api/v1/institutions/staff` — List staff with branch, role, and active task count (`staff.view`).
- `POST /api/v1/institutions/staff` — Create staff account with branch and role (`staff.create`).
- `PUT /api/v1/institutions/staff/:id` — Update staff profile, role, branch, and status (`staff.update`).
- `DELETE /api/v1/institutions/staff/:id` — Soft-deactivate staff member (`staff.deactivate`).

### Branch Operations & Transfers
- `GET /api/v1/institutions/branches` — List institution branches (`branches.view`).
- `POST /api/v1/institutions/branches` — Create branch (`branches.manage`).
- `POST /api/v1/institutions/reports/:id/transfer-branch` — Initiate branch transfer (`reports.transfer_branch`).
- `GET /api/v1/institutions/transfers` — List pending/historical branch transfers (`reports.transfer_branch`).
- `POST /api/v1/institutions/transfers/:transferId/review` — Accept or reject branch transfer (`reports.transfer_branch`).

### Report Assignment & Two-Stage Review
- `GET /api/v1/institutions/reports` — Scoped reports inbox (supports `?assigned_to_me=true`, `?unassigned=true`, `?branch_id=`, `?status=`).
- `GET /api/v1/institutions/reports/:id` — Scoped report detail with history, attachments, and branch transfers.
- `POST /api/v1/institutions/reports/:id/assign` — Assign/reassign report to staff operative and branch (`reports.assign_staff`).
- `POST /api/v1/institutions/reports/:id/submit-completion` — Staff submits work for review with notes & evidence (`reports.submit_completion`).
- `POST /api/v1/institutions/reports/:id/review-completion` — Super Admin approves resolution or returns work (`reports.review_completion`).

### Audit Trail
- `GET /api/v1/institutions/audit` — Paginated institutional audit log (`reports.view_audit`).

---

## 6. How to Run Migrations & Test

```bash
# 1. Apply database migration
node -e "const { Client } = require('pg'); const fs = require('fs'); const c = new Client('postgres://furko_user:furko_password@localhost:5432/furko_db'); const sql = fs.readFileSync('database/migrations/001_institution_rbac_and_transfers.sql', 'utf8'); c.connect().then(() => c.query(sql)).then(() => { console.log('Migration applied successfully'); c.end(); });"

# 2. Run backend test suite (100% passing)
cd backend
npm test

# 3. Run individual RBAC assignment test suite
npx tsx tests/rbac_assignment.test.ts

# 4. Build and verify React frontend
cd ../frontend/web
npm run build
```
