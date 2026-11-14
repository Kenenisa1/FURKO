import adminApi from './adminApiClient.js';
import { mockServiceAreas } from '../../data/mockAdminData.js'; // if file uses mockServiceAreas key name
// The file originally used an in-memory serviceAreas; keep fallback to mockServiceAreas

export async function getServiceAreas() {
  try {
    const resp = await adminApi.get('/admin/service-areas');
    return resp.data?.data || resp.data;
  } catch (err) {
    // fallback to existing mock variable if present
    if (typeof mockServiceAreas !== 'undefined') {
      return [...mockServiceAreas].sort((a, b) => a.name.localeCompare(b.name));
    }
    // If original module had local array, throw
    throw err;
  }
}

export async function getServiceAreaById(id) {
  try {
    const resp = await adminApi.get(`/admin/service-areas/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      const area = mockServiceAreas.find((a) => a.id === id);
      if (!area) throw err;
      return { ...area };
    }
    throw err;
  }
}

export async function createServiceArea(data) {
  try {
    const resp = await adminApi.post('/admin/service-areas', data);
    return resp.data?.data || resp.data;
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      const nextId = String(mockServiceAreas.length + 1);
      const newArea = {
        id: nextId,
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        institutionCount: 0,
        reportCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockServiceAreas.push(newArea);
      return { ...newArea };
    }
    throw err;
  }
}

export async function updateServiceArea(id, data) {
  try {
    const resp = await adminApi.put(`/admin/service-areas/${id}`, data);
    return resp.data?.data || resp.data;
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      const idx = mockServiceAreas.findIndex((a) => a.id === id);
      if (idx === -1) throw err;
      mockServiceAreas[idx] = { ...mockServiceAreas[idx], ...data };
      return { ...mockServiceAreas[idx] };
    }
    throw err;
  }
}

export async function toggleServiceAreaStatus(id) {
  try {
    const resp = await adminApi.post(`/admin/service-areas/${id}/toggle-status`);
    return resp.data?.data || resp.data;
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      const idx = mockServiceAreas.findIndex((a) => a.id === id);
      if (idx === -1) throw err;
      mockServiceAreas[idx].status = mockServiceAreas[idx].status === 'active' ? 'inactive' : 'active';
      return { ...mockServiceAreas[idx] };
    }
    throw err;
  }
}

export async function deleteServiceArea(id) {
  try {
    const resp = await adminApi.delete(`/admin/service-areas/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      const idx = mockServiceAreas.findIndex((a) => a.id === id);
      if (idx === -1) throw err;
      mockServiceAreas.splice(idx, 1);
      return { success: true };
    }
    throw err;
  }
}
export async function getActiveServiceAreas() {
  try {
    const areas = await getServiceAreas();
    return (Array.isArray(areas) ? areas : []).filter((a) => a.status === 'active');
  } catch (err) {
    if (typeof mockServiceAreas !== 'undefined') {
      return mockServiceAreas.filter((a) => a.status === 'active');
    }
    return [];
  }
}