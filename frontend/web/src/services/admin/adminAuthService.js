// ──────────────────────────────────────────────
// FURKO — Admin Auth Service (mock)
// Replace with real API calls when backend is ready
// POST /auth/admin/login  →  { token, user }
// ──────────────────────────────────────────────

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

/**
 * Simulates admin login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object }>}
 */
export async function loginAdmin(email, password) {
  await delay(600);

  const match = MOCK_ADMIN_CREDENTIALS.find(
    (c) => c.email === email.trim().toLowerCase() && c.password === password
  );

  if (!match) {
    throw new Error('Invalid admin credentials');
  }

  sessionStorage.setItem('furko_admin_user', JSON.stringify(match.user));
  return { user: match.user };
}

export async function logoutAdmin() {
  await delay(200);
  sessionStorage.removeItem('furko_admin_user');
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
