// ──────────────────────────────────────────────
// FURKO — Institutions API Service (mock)
// ──────────────────────────────────────────────

import { mockInstitutions } from '../../data/mockAdminData.js';

let institutions = [...mockInstitutions];

export async function getInstitutions(filters = {}) {
  await delay(300);
  
  let filtered = [...institutions];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(search) ||
        i.type.toLowerCase().includes(search)
    );
  }
  
  if (filters.status) {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  
  return filtered;
}

export async function getInstitutionById(id) {
  await delay(200);
  const institution = institutions.find((i) => i.id === id);
  if (!institution) throw new Error('Institution not found');
  return institution;
}

export async function createInstitution(data) {
  await delay(400);
  const newInstitution = {
    id: `INST-${String(institutions.length + 1).padStart(3, '0')}`,
    ...data,
    assignedReports: 0,
    staffCount: 0,
    createdAt: new Date().toISOString(),
  };
  institutions.push(newInstitution);
  return newInstitution;
}

export async function updateInstitution(id, updates) {
  await delay(400);
  const index = institutions.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Institution not found');
  
  institutions[index] = { ...institutions[index], ...updates };
  return institutions[index];
}

export async function deleteInstitution(id) {
  await delay(300);
  const index = institutions.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Institution not found');
  
  institutions.splice(index, 1);
  return { success: true };
}

export async function toggleInstitutionStatus(id) {
  await delay(300);
  const institution = institutions.find((i) => i.id === id);
  if (!institution) throw new Error('Institution not found');
  
  institution.status = institution.status === 'active' ? 'inactive' : 'active';
  return institution;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
