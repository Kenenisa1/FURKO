// ──────────────────────────────────────────────
// FURKO — Auth Service (real API)
// POST /api/v1/auth/login  →  { success, data: { token, user } }
// ──────────────────────────────────────────────

const API_BASE = '/api/v1';

/**
 * Logs in a staff/admin user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object }>}
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || json.message || 'Invalid email or password.');
  }

  const { user, token } = json.data;

  // Store session
  sessionStorage.setItem('furko_token', token);
  sessionStorage.setItem('furko_user', JSON.stringify(user));

  return { user };
}

export async function logout() {
  sessionStorage.removeItem('furko_token');
  sessionStorage.removeItem('furko_user');
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('furko_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return sessionStorage.getItem('furko_token') || null;
}
