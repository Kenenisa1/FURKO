// ──────────────────────────────────────────────
// FURKO — Report Service (mock)
// All functions operate on in-memory state.
// Replace function bodies with fetch() calls when backend is ready:
//   GET    /api/reports
//   GET    /api/reports/:id
//   POST   /api/reports/:id/accept
//   POST   /api/reports/:id/redirect
//   POST   /api/reports/:id/reject
//   POST   /api/reports/:id/assign
//   POST   /api/reports/:id/resolve
// ──────────────────────────────────────────────

import { mockReports, REPORT_STATUS } from '../data/mockReports.js';

// In-memory store — initialised from mock data
let _reports = mockReports.map((r) => ({ ...r }));

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function now() {
  return new Date().toISOString();
}

// ── READ ─────────────────────────────────────

export async function getReports() {
  await delay();
  return [..._reports];
}

export async function getReportById(id) {
  await delay(300);
  const report = _reports.find((r) => r.id === id);
  if (!report) throw new Error(`Report ${id} not found.`);
  return { ...report };
}

// ── WORKFLOW ACTIONS ─────────────────────────

export async function acceptReport(id) {
  await delay();
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    const timestamp = now();
    return {
      ...r,
      status: REPORT_STATUS.UNDER_REVIEW,
      timeline: [
        ...r.timeline,
        { stage: 'Under Review', completedAt: timestamp, note: 'Report accepted and under review' },
      ],
      activity: [
        ...r.activity,
        { time: timestamp, action: 'Report accepted by institution — moved to Under Review' },
      ],
    };
  });
  return getReportById(id);
}

export async function redirectReport(id, { destinationName, reason }) {
  await delay();
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    const timestamp = now();
    return {
      ...r,
      status: REPORT_STATUS.REDIRECTED,
      timeline: [
        ...r.timeline,
        { stage: 'Redirected', completedAt: timestamp, note: `Redirected to ${destinationName}` },
      ],
      activity: [
        ...r.activity,
        {
          time: timestamp,
          action: `Report redirected to ${destinationName}. Reason: ${reason}`,
        },
      ],
    };
  });
  return getReportById(id);
}

export async function rejectReport(id, { reason, explanation }) {
  await delay();
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    const timestamp = now();
    return {
      ...r,
      status: REPORT_STATUS.REJECTED,
      timeline: [
        ...r.timeline,
        { stage: 'Rejected', completedAt: timestamp, note: `Rejected: ${reason}` },
      ],
      activity: [
        ...r.activity,
        {
          time: timestamp,
          action: `Report rejected. Reason: ${reason}${explanation ? ` — ${explanation}` : ''}`,
        },
      ],
    };
  });
  return getReportById(id);
}

export async function assignReport(id, { department, assignedTo, assignmentNote, dueDate }) {
  await delay();
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    const timestamp = now();
    return {
      ...r,
      status: REPORT_STATUS.IN_PROGRESS,
      department,
      assignedTo,
      assignmentNote,
      dueDate: dueDate || null,
      timeline: [
        ...r.timeline,
        ...(r.status === REPORT_STATUS.UNDER_REVIEW || r.status === REPORT_STATUS.NEW
          ? [{ stage: 'Accepted', completedAt: timestamp, note: 'Accepted before assignment' }]
          : []),
        { stage: 'Assigned', completedAt: timestamp, note: `Assigned to ${assignedTo} — ${department}` },
        { stage: 'In Progress', completedAt: timestamp, note: 'Work started' },
      ],
      activity: [
        ...r.activity,
        {
          time: timestamp,
          action: `Assigned to ${assignedTo} (${department})${assignmentNote ? ` — Note: ${assignmentNote}` : ''}`,
        },
        { time: timestamp, action: 'Status changed to In Progress' },
      ],
    };
  });
  return getReportById(id);
}

export async function resolveReport(id, { description, resolvedBy, photos }) {
  await delay();
  _reports = _reports.map((r) => {
    if (r.id !== id) return r;
    const timestamp = now();
    return {
      ...r,
      status: REPORT_STATUS.RESOLVED,
      resolution: {
        description,
        resolvedAt: timestamp,
        resolvedBy,
        photos: photos || [],
      },
      timeline: [
        ...r.timeline,
        { stage: 'Resolved', completedAt: timestamp, note: 'Work completed and verified' },
      ],
      activity: [
        ...r.activity,
        { time: timestamp, action: `Report resolved by ${resolvedBy}` },
        { time: timestamp, action: 'Report marked as Resolved' },
      ],
    };
  });
  return getReportById(id);
}
