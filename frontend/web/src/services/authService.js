// ──────────────────────────────────────────────
// FURKO — Auth Service (mock)
// Replace with real API calls when backend is ready
// POST /auth/login  →  { token, user }
// ──────────────────────────────────────────────

const MOCK_CREDENTIALS = [
  {
    email: 'institution@furko.local',
    password: 'password',
    user: {
      id: 'STF-002',
      name: 'Eman Muhammed',
      role: 'Senior Staff',
      department: 'Water Services',
      email: 'institution@furko.local',
      institution: 'Jimma Water Service',
      institutionType: 'Government Institution',
      avatar: null,
    },
  },
  {
    email: 'admin@furko.local',
    password: 'password',
    user: {
      id: 'STF-001',
      name: 'Abdullah Ziyad',
      role: 'Institution Staff',
      department: 'Water Services',
      email: 'admin@furko.local',
      institution: 'Jimma Water Service',
      institutionType: 'Government Institution',
      avatar: null,
    },
  },
];

/**
 * Simulates a login request.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object }>}
 */
export async function login(email, password) {
  // Simulate network delay
  await delay(700);

  const match = MOCK_CREDENTIALS.find(
    (c) => c.email === email.trim().toLowerCase() && c.password === password
  );

  if (!match) {
    throw new Error('Invalid email or password. Please try again.');
  }

  // In production: store JWT in httpOnly cookie or secure localStorage
  sessionStorage.setItem('furko_user', JSON.stringify(match.user));
  return { user: match.user };
}

export async function logout() {
  await delay(200);
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

// ── helpers ──────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
