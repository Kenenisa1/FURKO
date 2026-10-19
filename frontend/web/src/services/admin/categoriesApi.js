import adminApi from './adminApiClient.js';
import { mockCategories } from '../../data/mockAdminData.js';

export async function getCategories(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/categories', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
    let categories = [...mockCategories];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      categories = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      );
    }
    if (filters.status) categories = categories.filter((c) => c.status === filters.status);
    return categories;
  }
}

export async function getCategoryById(id) {
  try {
    const resp = await adminApi.get(`/admin/categories/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const cat = mockCategories.find((c) => c.id === id);
    if (!cat) throw err;
    return cat;
  }
}

export async function createCategory(data) {
  try {
    const resp = await adminApi.post('/admin/categories', data);
    return resp.data?.data || resp.data;
  } catch (err) {
    const newCategory = {
      id: `CAT-${String(mockCategories.length + 1).padStart(3, '0')}`,
      ...data,
      routingRules: 0,
      createdAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  }
}

export async function updateCategory(id, updates) {
  try {
    const resp = await adminApi.put(`/admin/categories/${id}`, updates);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw err;
    mockCategories[idx] = { ...mockCategories[idx], ...updates };
    return mockCategories[idx];
  }
}

export async function deleteCategory(id) {
  try {
    const resp = await adminApi.delete(`/admin/categories/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw err;
    mockCategories.splice(idx, 1);
    return { success: true };
  }
}

export async function toggleCategoryStatus(id) {
  try {
    const resp = await adminApi.post(`/admin/categories/${id}/toggle-status`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const cat = mockCategories.find((c) => c.id === id);
    if (!cat) throw err;
    cat.status = cat.status === 'active' ? 'inactive' : 'active';
    return cat;
  }
}