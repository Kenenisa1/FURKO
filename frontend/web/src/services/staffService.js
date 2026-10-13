// ──────────────────────────────────────────────
// FURKO — Staff Service (mock)
// Replace with:  GET/POST/PUT/DELETE /api/staff
// ──────────────────────────────────────────────

import { mockStaff } from '../data/mockStaff.js';

let _staff = mockStaff.map((s) => ({ ...s }));
let _nextId = _staff.length + 1;

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStaff() {
  await delay();
  return [..._staff];
}

export async function getStaffById(id) {
  await delay(200);
  return _staff.find((s) => s.id === id) || null;
}

export async function addStaff(staffData) {
  await delay();
  const id = `STF-${String(_nextId++).padStart(3, '0')}`;
  const newMember = { ...staffData, id, reportsHandled: 0, joinedAt: new Date().toISOString() };
  _staff = [..._staff, newMember];
  return newMember;
}

export async function updateStaff(id, updates) {
  await delay();
  _staff = _staff.map((s) => (s.id === id ? { ...s, ...updates } : s));
  return _staff.find((s) => s.id === id);
}

export async function deleteStaff(id) {
  await delay();
  _staff = _staff.filter((s) => s.id !== id);
}
