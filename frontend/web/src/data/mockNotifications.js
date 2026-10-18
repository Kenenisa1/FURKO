// ──────────────────────────────────────────────
// FURKO — Mock Notification Data
// ──────────────────────────────────────────────

export const mockNotifications = [
  {
    id: 'NOTIF-001',
    type: 'new_report',
    title: 'New Report Assigned',
    message: 'Report FR-2026-006 (Blocked Drainage Canal) has been submitted to your institution.',
    time: '2026-09-29T06:05:00Z',
    read: false,
    reportId: 'FR-2026-006',
  },
  {
    id: 'NOTIF-002',
    type: 'status_update',
    title: 'Report In Progress',
    message: 'Report FR-2026-008 is now In Progress. Abdullah Ziyad started field work.',
    time: '2026-09-26T11:00:00Z',
    read: false,
    reportId: 'FR-2026-008',
  },
  {
    id: 'NOTIF-003',
    type: 'redirect',
    title: 'Report Redirected',
    message: 'Report FR-2026-002 was redirected from Waste Management Authority.',
    time: '2026-09-27T15:15:00Z',
    read: false,
    reportId: 'FR-2026-002',
  },
  {
    id: 'NOTIF-004',
    type: 'resolved',
    title: 'Report Resolved',
    message: 'Report FR-2026-005 (Street Light Failure) has been successfully resolved.',
    time: '2026-09-24T15:30:00Z',
    read: true,
    reportId: 'FR-2026-005',
  },
  {
    id: 'NOTIF-005',
    type: 'new_report',
    title: 'Critical Report Received',
    message: 'Report FR-2026-007 (Broken Bridge Railing) received — Priority: Critical.',
    time: '2026-09-28T13:05:00Z',
    read: true,
    reportId: 'FR-2026-007',
  },
];
