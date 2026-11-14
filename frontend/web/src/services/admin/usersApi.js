// Users API — uses backend endpoints with fallback to mocks
import adminApi from './adminApiClient.js';
import { mockUsers } from '../../data/mockAdminData.js';

export async function getUsers(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/users', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
    // network / backend not available — fallback to mock filter logic
    let users = [...mockUsers];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }
    if (filters.role) {
      users = users.filter((u) => u.role === filters.role);
    }
    if (filters.status) {
      users = users.filter((u) => u.status === filters.status);
    }
    return users;
  }
}

export async function getUserById(id) {
  try {
    const resp = await adminApi.get(`/admin/users/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw err;
    return user;
  }
}

export async function createUser(userData) {
  try {
    const resp = await adminApi.post('/admin/users', userData);
    return resp.data?.data || resp.data;
  } catch (err) {
    // fallback to client-side mock
    const newUser = {
      id: `USR-${String(mockUsers.length + 1).padStart(3, '0')}`,
      ...userData,
      registeredAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  }
}

export async function updateUser(id, updates) {
  try {
    const resp = await adminApi.put(`/admin/users/${id}`, updates);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw err;
    mockUsers[idx] = { ...mockUsers[idx], ...updates };
    return mockUsers[idx];
  }
}

export async function deleteUser(id) {
  try {
    const resp = await adminApi.delete(`/admin/users/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw err;
    mockUsers.splice(idx, 1);
    return { success: true };
  }
}

export async function toggleUserStatus(id) {
  try {
    const resp = await adminApi.post(`/admin/users/${id}/toggle-status`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw err;
    user.status = user.status === 'active' ? 'inactive' : 'active';
    return user;
  }
}