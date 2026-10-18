// Admin Auth service: uses backend auth when available, falls back to the existing mock.
import adminApi from './adminApiClient.js';
const MOCK_ADMIN_CREDENTIALS = [
  {
    email: 'admin@furko.local',
    password: 'admin123',
    user: {
      id: 'USR-004',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@furko.local',
      avatar: null,
      permissions: [
        'manage_users',
        'manage_institutions',
        'manage_categories',
        'manage_routing',
        'review_reports',
        'view_audit_log',
        'system_settings',
      ],
    },
  },
  {
    email: 'superadmin@furko.local',
    password: 'super123',
    user: {
      id: 'USR-SUPER',
      name: 'Super Admin',
      role: 'admin',
      email: 'superadmin@furko.local',
      avatar: null,
      permissions: [
        'manage_users',
        'manage_institutions',
        'manage_categories',
        'manage_routing',
        'review_reports',
        'view_audit_log',
        'system_settings',
      ],
    },
  },
];

export async function loginAdmin(email, password) {
  // Try real backend first
  try {
    const resp = await adminApi.post('/auth/login', {
      email,
      password,
    });
    // Expecting structure: { success: true, data: { user, token } }
    const data = resp?.data?.data || resp?.data;
    const user = data.user || data;
    const token = data.token;
    if (!token || !user) {
      throw new Error('Invalid login response from server');
    }
    sessionStorage.setItem('furko_admin_token', token);
    sessionStorage.setItem('furko_admin_user', JSON.stringify(user));
    return { user };
  } catch (err) {
    // Fallback to mock credentials in development
    const match = MOCK_ADMIN_CREDENTIALS.find(
      (c) => c.email === String(email).trim().toLowerCase() && c.password === password
    );
    if (match) {
      const mockToken = 'demo-admin-token';
      sessionStorage.setItem('furko_admin_token', mockToken);
      sessionStorage.setItem('furko_admin_user', JSON.stringify(match.user));
      return { user: match.user };
    }
    // Bubble up real error for UI to surface
    throw err;
  }
}

export async function logoutAdmin() {
  // Optionally inform backend, but always clear client session
  try {
    await adminApi.post('/auth/logout').catch(() => {});
  } catch (e) {
    // ignore
  } finally {
    sessionStorage.removeItem('furko_admin_token');
    sessionStorage.removeItem('furko_admin_user');
  }
}

export function getStoredAdminUser() {
  try {
    const raw = sessionStorage.getItem('furko_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}