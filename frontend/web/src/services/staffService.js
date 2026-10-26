// ──────────────────────────────────────────────
// FURKO — Staff Service (Real Database API)
// Connects to /api/v1/institutions/staff
// ──────────────────────────────────────────────

import { getStoredToken } from './authService.js';

const API_BASE = '/api/v1/institutions';

export const departments = [
  'Operations',
  'Field Inspection',
  'Road Infrastructure',
  'Water & Sewerage',
  'Waste Management',
  'Power & Lighting',
  'Customer Relations',
  'Administration',
];

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
  if (!res.ok) {
    throw new Error(json.message || json.error || `Request failed with status ${res.status}`);
  }
  return json;
}

export async function getStaff() {
  const json = await apiFetch('/staff');
  return json.data || [];
}

export async function getStaffById(id) {
  const staff = await getStaff();
  return staff.find((s) => s.id === id) || null;
}

export async function addStaff(staffData) {
  const json = await apiFetch('/staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
  return json.data;
}

export async function updateStaff(id, updates) {
  const json = await apiFetch(`/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return json.data;
}

export async function deleteStaff(id) {
  await apiFetch(`/staff/${id}`, {
    method: 'DELETE',
  });
}
