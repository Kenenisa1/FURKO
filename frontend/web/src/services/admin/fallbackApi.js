// Fallback queue service
import adminApi from './adminApiClient.js';
import { mockFallbackQueue } from '../../data/mockAdminData.js';

export async function getFallbackQueue(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/fallback-queue', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
    // fallback to mock
    let q = [...mockFallbackQueue];
    if (filters.status) q = q.filter((i) => i.reviewStatus === filters.status);
    return q;
  }
}

export async function reviewFallbackItem(id, reviewPayload) {
  try {
    const resp = await adminApi.post(`/admin/fallback-queue/${id}/review`, reviewPayload);
    return resp.data?.data || resp.data;
  } catch (err) {
    throw err;
  }
}