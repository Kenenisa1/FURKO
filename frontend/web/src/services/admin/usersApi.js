// ──────────────────────────────────────────────
// FURKO — Users API Service (mock)
// GET    /api/v1/admin/users
// POST   /api/v1/admin/users
// PUT    /api/v1/admin/users/:id
// DELETE /api/v1/admin/users/:id
// ──────────────────────────────────────────────

import { mockUsers } from '../../data/mockAdminData.js';

let users = [...mockUsers];

export async function getUsers(filters = {}) {
  await delay(300);
  
  let filtered = [...users];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
  }
  
  if (filters.role) {
    filtered = filtered.filter((u) => u.role === filters.role);
  }
  
  if (filters.status) {
    filtered = filtered.filter((u) => u.status === filters.status);
  }
  
  return filtered;
}

export async function getUserById(id) {
  await delay(200);
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function createUser(userData) {
  await delay(400);
  const newUser = {
    id: `USR-${String(users.length + 1).padStart(3, '0')}`,
    ...userData,
    registeredAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

export async function updateUser(id, updates) {
  await delay(400);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('User not found');
  
  users[index] = { ...users[index], ...updates };
  return users[index];
}

export async function deleteUser(id) {
  await delay(300);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('User not found');
  
  users.splice(index, 1);
  return { success: true };
}

export async function toggleUserStatus(id) {
  await delay(300);
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  
  user.status = user.status === 'active' ? 'inactive' : 'active';
  return user;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
