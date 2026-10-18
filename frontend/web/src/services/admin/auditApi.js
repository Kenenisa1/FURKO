// ──────────────────────────────────────────────
// FURKO — Audit Log API Service (mock)
// ──────────────────────────────────────────────

import { mockAuditLog } from '../../data/mockAdminData.js';

export async function getAuditLog(filters = {}) {
  await delay(300);
  
  let filtered = [...mockAuditLog];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.action.toLowerCase().includes(search) ||
        a.actor.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
    );
  }
  
  if (filters.action) {
    filtered = filtered.filter((a) => a.action === filters.action);
  }
  
  if (filters.entityType) {
    filtered = filtered.filter((a) => a.entityType === filters.entityType);
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return filtered;
}

export async function getAuditEntryById(id) {
  await delay(200);
  const entry = mockAuditLog.find((a) => a.id === id);
  if (!entry) throw new Error('Audit entry not found');
  return entry;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
