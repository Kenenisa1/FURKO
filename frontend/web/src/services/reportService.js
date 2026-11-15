// ──────────────────────────────────────────────
// FURKO — Report Service (real API)
// Backed by GET/POST  /api/v1/institutions/reports
// Field names are normalized from DB snake_case to
// the camelCase shape the UI pages expect.
// ──────────────────────────────────────────────

import { getStoredToken } from './authService.js';

const API_BASE = '/api/v1';

export const REPORT_STATUS = {
  NEW:                  'submitted',
  ROUTED:               'routed',
  UNDER_REVIEW:         'under_review',
  ACCEPTED:             'accepted',
  ASSIGNED:             'assigned',
  IN_PROGRESS:          'in_progress',
  SUBMITTED_FOR_REVIEW: 'submitted_for_review',
  REDIRECTED:           'redirected',
  RESOLVED:             'resolved',
  REJECTED:             'rejected',
  REOPENED:             'reopened',
};

function authHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || `Request failed: ${res.status}`);
  return json;
}

/**
 * Normalize a raw DB report row into the shape the UI components expect.
 * Maps snake_case DB columns → camelCase UI fields.
 */
function normalizeReport(r) {
  return {
    ...r,
    // Timestamps
    submittedAt: r.submitted_at ?? r.submittedAt,
    updatedAt:   r.updated_at  ?? r.updatedAt,
    // Category (DB: category_name, UI: category)
    category: r.category_name ?? r.category ?? '—',
    // Location: flatten DB location columns into the nested shape UI expects
    location: r.location ?? {
      address:  r.address_text  ?? r.landmark ?? '—',
      kebele:   r.landmark      ?? '—',
      woreda:   '—',
      city:     'Jimma City',
      coordinates: (r.latitude && r.longitude)
        ? { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) }
        : null,
    },
    // Activity log: map from status_history shape if present
    activity: r.activity ?? (r.history ?? []).map((h) => ({
      time:   h.changed_at,
      action: h.comment || `Status changed to ${h.new_status}`,
    })),
    // Timeline: build from audit_history or status_history
    timeline: r.timeline ?? [],
    // Transfers history
    transfers: r.transfers ?? [],
    // Branch & Staff metadata
    branchName: r.branch_name ?? '—',
    branchCode: r.branch_code ?? '—',
    assignedStaffName: r.assigned_staff_name ?? null,
    assignedStaffPhone: r.assigned_staff_phone ?? null,
    // Photos
    photos: r.photos ?? [],
  };
}

// ── READ ─────────────────────────────────────

export async function getReports(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.branch_id) query.append('branch_id', filters.branch_id);
  if (filters.assigned_to_me) query.append('assigned_to_me', 'true');
  if (filters.unassigned) query.append('unassigned', 'true');
  if (filters.search) query.append('search', filters.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch(`/institutions/reports${qs}`);
  return (json.reports ?? []).map(normalizeReport);
}

export async function getReportById(id) {
  const json = await apiFetch(`/institutions/reports/${id}`);
  return normalizeReport(json.report ?? json);
}

// Fetch all active institutions (for redirect dropdown)
export async function getInstitutions() {
  try {
    const json = await apiFetch('/institutions/list');
    return json.institutions ?? json.data ?? [];
  } catch {
    return [];
  }
}

// Fetch branches for institution
export async function getBranches() {
  const json = await apiFetch('/institutions/branches');
  return json.data || [];
}

export async function createBranch(branchData) {
  const json = await apiFetch('/institutions/branches', {
    method: 'POST',
    body: JSON.stringify(branchData),
  });
  return json.data;
}

// Fetch institution profile
export async function getProfile() {
  const json = await apiFetch('/institutions/profile');
  return json.data;
}

// Update institution profile
export async function updateProfile(updates) {
  const json = await apiFetch('/institutions/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return json.data;
}

// ── WORKFLOW ACTIONS ─────────────────────────

async function postAction(id, action, body = {}) {
  return apiFetch(`/institutions/reports/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, ...body }),
  });
}

export async function acceptReport(id) {
  await postAction(id, 'accept');
  return getReportById(id);
}

export async function redirectReport(id, { destinationName, destinationId, reason }) {
  await postAction(id, 'redirect', {
    institution_id: destinationId,
    comment: reason,
  });
  return { id, status: REPORT_STATUS.REDIRECTED, redirectedTo: destinationName };
}

export async function rejectReport(id, { reason, explanation }) {
  await postAction(id, 'reject', {
    comment: [reason, explanation].filter(Boolean).join(' — '),
  });
  return getReportById(id);
}

export async function assignReport(id, { assignedTo, branchId, assignmentNote, priority }) {
  await apiFetch(`/institutions/reports/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({
      staff_user_id: assignedTo,
      branch_id: branchId || null,
      comment: assignmentNote || null,
      priority: priority || null,
    }),
  });
  return getReportById(id);
}

export async function submitCompletion(id, { notes, proofUrl }) {
  const json = await apiFetch(`/institutions/reports/${id}/submit-completion`, {
    method: 'POST',
    body: JSON.stringify({ notes, proof_url: proofUrl }),
  });
  return json;
}

export async function reviewCompletion(id, { decision, comment, resolutionNotes }) {
  const json = await apiFetch(`/institutions/reports/${id}/review-completion`, {
    method: 'POST',
    body: JSON.stringify({
      decision,
      comment,
      resolution_notes: resolutionNotes,
    }),
  });
  return json;
}

export async function transferBranchReport(id, { toBranchId, reason }) {
  const json = await apiFetch(`/institutions/reports/${id}/transfer-branch`, {
    method: 'POST',
    body: JSON.stringify({ to_branch_id: toBranchId, reason }),
  });
  return json.data;
}

export async function getBranchTransfers(status = '') {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const json = await apiFetch(`/institutions/transfers${qs}`);
  return json.data || [];
}

export async function reviewBranchTransfer(transferId, { decision, comment }) {
  const json = await apiFetch(`/institutions/transfers/${transferId}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, comment }),
  });
  return json.data;
}

export async function getAuditLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.action) query.append('action', params.action);
  if (params.entityType) query.append('entity_type', params.entityType);
  if (params.entityId) query.append('entity_id', params.entityId);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const json = await apiFetch(`/institutions/audit${qs}`);
  return json;
}

export async function resolveReport(id, { description, resolvedBy }) {
  await postAction(id, 'resolve', {
    comment: `${resolvedBy ? resolvedBy + ': ' : ''}${description}`,
  });
  return getReportById(id);
}
