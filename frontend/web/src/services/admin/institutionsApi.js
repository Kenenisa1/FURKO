import adminApi from './adminApiClient.js';
import { mockInstitutions } from '../../data/mockAdminData.js';

export async function getInstitutions(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/institutions', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
    let institutions = [...mockInstitutions];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      institutions = institutions.filter(
        (i) => i.name.toLowerCase().includes(search) || i.type.toLowerCase().includes(search)
      );
    }
    if (filters.status) institutions = institutions.filter((i) => i.status === filters.status);
    return institutions;
  }
}

export async function getInstitutionById(id) {
  try {
    const resp = await adminApi.get(`/admin/institutions/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const inst = mockInstitutions.find((i) => i.id === id);
    if (!inst) throw err;
    return inst;
  }
}

export async function createInstitution(data) {
  try {
    const resp = await adminApi.post('/admin/institutions', data);
    return resp.data?.data || resp.data;
  } catch (err) {
    const newInstitution = {
      id: `INST-${String(mockInstitutions.length + 1).padStart(3, '0')}`,
      ...data,
      assignedReports: 0,
      staffCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockInstitutions.push(newInstitution);
    return newInstitution;
  }
}

export async function updateInstitution(id, updates) {
  try {
    const resp = await adminApi.put(`/admin/institutions/${id}`, updates);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockInstitutions.findIndex((i) => i.id === id);
    if (idx === -1) throw err;
    mockInstitutions[idx] = { ...mockInstitutions[idx], ...updates };
    return mockInstitutions[idx];
  }
}

export async function deleteInstitution(id) {
  try {
    const resp = await adminApi.delete(`/admin/institutions/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockInstitutions.findIndex((i) => i.id === id);
    if (idx === -1) throw err;
    mockInstitutions.splice(idx, 1);
    return { success: true };
  }
}

export async function toggleInstitutionStatus(id) {
  try {
    const resp = await adminApi.post(`/admin/institutions/${id}/toggle-status`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const inst = mockInstitutions.find((i) => i.id === id);
    if (!inst) throw err;
    inst.status = inst.status === 'active' ? 'inactive' : 'active';
    return inst;
  }
}