import adminApi from './adminApiClient.js';
import { mockAuditLog } from '../../data/mockAdminData.js';

export async function getAuditLog(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/audit-log', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
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
    if (filters.action) filtered = filtered.filter((a) => a.action === filters.action);
    if (filters.entityType) filtered = filtered.filter((a) => a.entityType === filters.entityType);
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return filtered;
  }
}

export async function getAuditEntryById(id) {
  try {
    const resp = await adminApi.get(`/admin/audit-log/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const entry = mockAuditLog.find((a) => a.id === id);
    if (!entry) throw err;
    return entry;
  }
}