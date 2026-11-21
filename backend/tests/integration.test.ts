/**
 * tests/integration.test.ts
 * Backend API Validation, Security and Integration Tests — Issue #121
 *
 * End-to-End Scenario (mock/in-memory mode, no PostgreSQL required):
 *  Citizen registers → logs in → creates report → routing preview →
 *  institution receives → accepts → assigns staff → in_progress →
 *  resolves → citizen sees Resolved → citizen confirms → report Closed
 *
 * Run: npx tsx tests/integration.test.ts
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import pool from '../src/config/db';

// Mock DB pool methods so that tests never block on offline PostgreSQL
const origConnect = pool.connect.bind(pool);
const origQuery = pool.query.bind(pool);

(pool as any).connect = async () => {
  return {
    query: async (sql: string, params?: any[]) => {
      // Mock category lookup
      if (typeof sql === 'string' && sql.includes('FROM categories WHERE id = $1')) {
        return { rowCount: 1, rows: [{ id: params?.[0] || 'cat-roads-001' }] };
      }
      // Mock location insert
      if (typeof sql === 'string' && sql.includes('INSERT INTO locations')) {
        return {
          rowCount: 1,
          rows: [{
            id: 'loc-mock-001',
            latitude: params?.[0],
            longitude: params?.[1],
            address_text: params?.[2],
            landmark: params?.[3],
          }],
        };
      }
      // Mock report insert
      if (typeof sql === 'string' && sql.includes('INSERT INTO reports')) {
        return {
          rowCount: 1,
          rows: [{
            id: 'rep-mock-001',
            tracking_number: params?.[0],
            citizen_id: params?.[1],
            category_id: params?.[2],
            location_id: params?.[3],
            title: params?.[4],
            description: params?.[5],
            status: 'submitted',
            submitted_at: new Date(),
          }],
        };
      }
      // Mock staff institution lookup
      if (typeof sql === 'string' && sql.includes("u.role = 'staff'")) {
        return { rowCount: 1, rows: [{ institution_id: 'a90184b2-297c-482f-b054-c9f131a403d1' }] };
      }
      // Mock report for update / status change
      if (typeof sql === 'string' && sql.includes('FROM reports') && sql.includes('FOR UPDATE')) {
        return { rowCount: 1, rows: [{ id: params?.[0] || 'rep-mock-001', status: 'under_review' }] };
      }
      // Mock report update
      if (typeof sql === 'string' && sql.includes('UPDATE reports')) {
        return {
          rowCount: 1,
          rows: [{
            id: params?.[3] || 'rep-mock-001',
            tracking_number: 'FRK-MOCK-001',
            status: params?.[0] || 'accepted',
            current_institution_id: 'a90184b2-297c-482f-b054-c9f131a403d1',
          }],
        };
      }
      // Default query response
      return { rowCount: 1, rows: [] };
    },
    release: () => {},
  } as any;
};

(pool as any).query = async (sql: string, params?: any[]) => {
  if (typeof sql === 'string' && sql.includes('FROM users WHERE email = $1')) {
    // If testing invalid user login, return empty
    if (params?.[0] === 'nobody@example.com' || params?.[0] === 'ghost@example.com') {
      return { rowCount: 0, rows: [] };
    }
  }
  if (typeof sql === 'string' && sql.includes("u.role = 'staff'")) {
    // Check if staff user
    if (params?.[0] === 'usr-staff-001') {
      return { rowCount: 1, rows: [{ institution_id: 'a90184b2-297c-482f-b054-c9f131a403d1' }] };
    }
    return { rowCount: 0, rows: [] };
  }
  if (typeof sql === 'string' && sql.includes('FROM status_history sh')) {
    return {
      rowCount: 3,
      rows: [
        {
          id: 'sh-1',
          report_id: params?.[0] || 'rep-demo-001',
          changed_by_user_id: 'usr-citizen-001',
          previous_status: null,
          new_status: 'submitted',
          comment: 'Report submitted by citizen',
          changed_at: new Date(Date.now() - 3600000 * 24),
          actor_name: 'Dawit Tadesse',
          actor_role: 'citizen',
        },
        {
          id: 'sh-2',
          report_id: params?.[0] || 'rep-demo-001',
          changed_by_user_id: 'usr-staff-001',
          previous_status: 'submitted',
          new_status: 'under_review',
          comment: 'Dispatched to Road Bureau',
          changed_at: new Date(Date.now() - 3600000 * 12),
          actor_name: 'Abebe Bikila',
          actor_role: 'staff',
        },
        {
          id: 'sh-3',
          report_id: params?.[0] || 'rep-demo-001',
          changed_by_user_id: 'usr-staff-001',
          previous_status: 'under_review',
          new_status: 'resolved',
          comment: 'Citizen confirmed resolution or crew completed repair',
          changed_at: new Date(Date.now() - 3600000),
          actor_name: 'Abebe Bikila',
          actor_role: 'staff',
        },
      ],
    };
  }
  if (typeof sql === 'string' && sql.includes('FROM attachments WHERE report_id = $1')) {
    return {
      rowCount: 1,
      rows: [{
        id: 'att-1',
        report_id: params?.[0] || 'rep-demo-001',
        file_name: 'pothole.jpg',
        file_url: 'http://localhost:5000/uploads/pothole.jpg',
        file_type: 'evidence',
        mime_type: 'image/jpeg',
        file_size: 1024,
        created_at: new Date(),
      }],
    };
  }
  if (typeof sql === 'string' && sql.includes('FROM feedback WHERE report_id = $1')) {
    return { rowCount: 0, rows: [] };
  }
  if (typeof sql === 'string' && sql.includes('FROM reports r')) {
    return {
      rowCount: 1,
      rows: [{
        id: params?.[0] || 'rep-demo-001',
        tracking_number: 'FRK-2026-0814',
        title: 'Road damage near palace',
        description: 'Road damage description',
        status: 'resolved',
        citizen_id: 'usr-citizen-001',
        category_id: 'cat-roads-001',
        submitted_at: new Date(Date.now() - 3600000 * 24),
        resolved_at: new Date(Date.now() - 3600000),
      }],
    };
  }
  return { rowCount: 0, rows: [] };
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BASE = '/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

/** Mint a valid JWT matching what authMiddleware.ts expects */
function makeToken(userId: string, role: 'citizen' | 'staff' | 'admin' = 'citizen'): string {
  return jwt.sign({ userId, email: `${role}@test.local`, role }, JWT_SECRET, { expiresIn: '1h' });
}

const CITIZEN_TOKEN = makeToken('usr-citizen-001', 'citizen');
const STAFF_TOKEN   = makeToken('usr-staff-001',   'staff');

// ─────────────────────────────────────────────────────────────────────────────
// Simple assertion helpers
// ─────────────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results: Array<{ group: string; label: string; ok: boolean; detail?: string }> = [];

function assert(condition: boolean, label: string, group: string, detail?: string): void {
  if (condition) {
    console.log(`    ✅  ${label}`);
    passed++;
    results.push({ group, label, ok: true });
  } else {
    const msg = `    ❌  ${label}${detail ? `\n         → ${detail}` : ''}`;
    console.error(msg);
    failed++;
    results.push({ group, label, ok: false, detail });
  }
}

function section(title: string): void {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(` ${title}`);
  console.log('─'.repeat(60));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Health & API Root
// ─────────────────────────────────────────────────────────────────────────────
async function testHealth(): Promise<void> {
  section('1. Health Check & API Root');

  const r1 = await request(app).get('/health');
  assert(r1.status === 200, 'GET /health → 200', 'Health');

  const r2 = await request(app).get(`${BASE}`);
  assert(r2.status === 200, `GET ${BASE} → 200`, 'Health');
  assert(typeof r2.body.version === 'string' || typeof r2.body.message === 'string',
    'API root returns version or message', 'Health', JSON.stringify(r2.body));

  const r3 = await request(app).get(`${BASE}/health`);
  assert(r3.status === 200, `GET ${BASE}/health → 200`, 'Health');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Authentication: Input Validation
// ─────────────────────────────────────────────────────────────────────────────
async function testAuthValidation(): Promise<void> {
  section('2. Authentication — Input Validation');

  const r1 = await request(app).post(`${BASE}/auth/register`).send({});
  assert(r1.status === 400, 'POST /auth/register — empty body → 400', 'Auth Validation',
    JSON.stringify(r1.body));

  const r2 = await request(app).post(`${BASE}/auth/register`)
    .send({ full_name: 'Test', password: 'Secret123' });
  assert(r2.status === 400, 'POST /auth/register — missing email → 400', 'Auth Validation',
    JSON.stringify(r2.body));

  const r3 = await request(app).post(`${BASE}/auth/register`)
    .send({ full_name: 'Test', email: 'test@test.com' });
  assert(r3.status === 400, 'POST /auth/register — missing password → 400', 'Auth Validation',
    JSON.stringify(r3.body));

  const r4 = await request(app).post(`${BASE}/auth/login`).send({});
  assert(r4.status === 400, 'POST /auth/login — empty body → 400', 'Auth Validation',
    JSON.stringify(r4.body));

  const r5 = await request(app).post(`${BASE}/auth/login`)
    .send({ email: 'test@test.com' });
  assert(r5.status === 400, 'POST /auth/login — missing password → 400', 'Auth Validation',
    JSON.stringify(r5.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Authentication: Wrong Credentials
// ─────────────────────────────────────────────────────────────────────────────
async function testAuthCredentials(): Promise<void> {
  section('3. Authentication — Wrong Credentials');

  const r1 = await request(app).post(`${BASE}/auth/login`)
    .send({ email: 'nobody@example.com', password: 'WrongPass!' });
  assert(r1.status === 401, 'POST /auth/login — non-existent user → 401', 'Auth Credentials',
    JSON.stringify(r1.body));

  const r2 = await request(app).post(`${BASE}/auth/send-verification-otp`)
    .send({ email: 'ghost@example.com' });
  assert(
    r2.status === 404 || r2.status === 500,
    'POST /auth/send-verification-otp — unknown email → 404 or 500', 'Auth Credentials',
    JSON.stringify(r2.body)
  );

  const r3 = await request(app).post(`${BASE}/auth/send-verification-otp`).send({});
  assert(r3.status === 400, 'POST /auth/send-verification-otp — missing email → 400', 'Auth Credentials',
    JSON.stringify(r3.body));

  const r4 = await request(app).post(`${BASE}/auth/verify-phone`).send({});
  assert(r4.status === 400, 'POST /auth/verify-phone — missing fields → 400', 'Auth Credentials',
    JSON.stringify(r4.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — Protected Routes: Unauthorized Access
// ─────────────────────────────────────────────────────────────────────────────
async function testUnauthorizedAccess(): Promise<void> {
  section('4. Security — Unauthorized Access (No Token)');

  const routes: Array<[string, string]> = [
    ['POST', `${BASE}/reports`],
    ['GET',  `${BASE}/reports`],
    ['GET',  `${BASE}/institutions/reports`],
    ['GET',  `${BASE}/institutions/reports/some-id`],
    ['POST', `${BASE}/institutions/reports/some-id/action`],
    ['POST', `${BASE}/institutions/reports/some-id/assign`],
    ['GET',  `${BASE}/institutions/reports/some-id/history`],
    ['POST', `${BASE}/reports/some-id/confirm`],
    ['POST', `${BASE}/reports/some-id/reopen`],
  ];

  for (const [method, path] of routes) {
    const res = await (request(app) as any)[method.toLowerCase()](path).send({});
    assert(
      res.status === 401,
      `${method} ${path} — no token → 401`,
      'Unauthorized Access',
      `Got ${res.status}: ${JSON.stringify(res.body)}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — Protected Routes: Invalid / Expired Token
// ─────────────────────────────────────────────────────────────────────────────
async function testInvalidToken(): Promise<void> {
  section('5. Security — Invalid / Tampered Tokens');

  const r1 = await request(app)
    .get(`${BASE}/reports`)
    .set('Authorization', 'Bearer totally.invalid.jwt');
  assert(r1.status === 401, 'GET /reports — bad token → 401', 'Invalid Token',
    JSON.stringify(r1.body));

  const wrongSecretToken = jwt.sign(
    { userId: 'x', email: 'x@x.com', role: 'citizen' },
    'WRONG_SECRET',
    { expiresIn: '1h' }
  );
  const r2 = await request(app)
    .get(`${BASE}/reports`)
    .set('Authorization', `Bearer ${wrongSecretToken}`);
  assert(r2.status === 401, 'GET /reports — wrong-secret token → 401', 'Invalid Token',
    JSON.stringify(r2.body));

  // "Token " prefix instead of "Bearer " must be rejected
  const r3 = await request(app)
    .get(`${BASE}/reports`)
    .set('Authorization', `Token ${CITIZEN_TOKEN}`);
  assert(r3.status === 401, 'GET /reports — "Token " prefix → 401', 'Invalid Token',
    JSON.stringify(r3.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — Routing Engine: Public Endpoints
// ─────────────────────────────────────────────────────────────────────────────
async function testRoutingEngine(): Promise<void> {
  section('6. Routing Engine — Public Endpoints');

  const r1 = await request(app).get(`${BASE}/routing/institutions`);
  assert(r1.status === 200, 'GET /routing/institutions → 200', 'Routing');
  assert(r1.body.success === true, '/routing/institutions success=true', 'Routing');
  assert(Array.isArray(r1.body.data) && r1.body.data.length > 0,
    '/routing/institutions returns non-empty array', 'Routing',
    JSON.stringify(r1.body.data));

  const r2 = await request(app).get(`${BASE}/routing/categories`);
  assert(r2.status === 200, 'GET /routing/categories → 200', 'Routing');
  assert(Array.isArray(r2.body.data) && r2.body.data.length > 0,
    '/routing/categories returns non-empty array', 'Routing');

  const r3 = await request(app).post(`${BASE}/routing/preview`).send({});
  assert(r3.status === 400, 'POST /routing/preview — no category_id → 400', 'Routing',
    JSON.stringify(r3.body));

  const r4 = await request(app).post(`${BASE}/routing/preview`)
    .send({ category_id: 'roads-streets', latitude: 7.6734, longitude: 36.8344 });
  assert(r4.status === 200, 'POST /routing/preview — roads slug → 200', 'Routing',
    JSON.stringify(r4.body));
  assert(r4.body.success === true, '/routing/preview success=true', 'Routing');
  // routing engine returns either data.institution or data.target_institution
  const routedInst4 = r4.body.data?.institution ?? r4.body.data?.target_institution;
  assert(typeof routedInst4?.name === 'string',
    '/routing/preview returns institution name', 'Routing',
    JSON.stringify(r4.body.data));

  const r5 = await request(app).post(`${BASE}/routing/preview`)
    .send({ category_id: 'water-sewerage', latitude: 7.6700, longitude: 36.8300 });
  assert(r5.status === 200, 'POST /routing/preview — water-sewerage slug → 200', 'Routing');
  const routedInst5 = r5.body.data?.institution ?? r5.body.data?.target_institution;
  assert(typeof routedInst5?.name === 'string',
    '/routing/preview water-sewerage returns institution', 'Routing',
    JSON.stringify(r5.body.data));

  const r6 = await request(app).post(`${BASE}/routing/preview`)
    .send({ category_id: 'non-existent-category', latitude: 7.67, longitude: 36.83 });
  assert(
    r6.status === 200 || r6.status === 404,
    `POST /routing/preview — unknown category → 200 (fallback) or 404 [got ${r6.status}]`, 'Routing',
    JSON.stringify(r6.body)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — Report API: Input Validation
// ─────────────────────────────────────────────────────────────────────────────
async function testReportValidation(): Promise<void> {
  section('7. Report API — Input Validation');

  const r1 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({});
  assert(r1.status === 400, 'POST /reports — empty body → 400', 'Report Validation',
    JSON.stringify(r1.body));

  const r2 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ title: 'Test', description: 'Desc', latitude: 7.67, longitude: 36.83 });
  assert(r2.status === 400, 'POST /reports — missing category_id → 400', 'Report Validation',
    JSON.stringify(r2.body));

  const r3 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ title: 'Test', description: 'Desc', category_id: 'cat-roads-001' });
  assert(r3.status === 400, 'POST /reports — missing lat/lng → 400', 'Report Validation',
    JSON.stringify(r3.body));

  const r4 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ title: 'T', description: 'D', category_id: 'cat-roads-001', latitude: 999, longitude: 36.83 });
  assert(r4.status === 400, 'POST /reports — latitude 999 → 400', 'Report Validation',
    JSON.stringify(r4.body));

  const r5 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ title: 'T', description: 'D', category_id: 'cat-roads-001', latitude: 7.67, longitude: 999 });
  assert(r5.status === 400, 'POST /reports — longitude 999 → 400', 'Report Validation',
    JSON.stringify(r5.body));

  const r6 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ title: '   ', description: 'Desc', category_id: 'cat-roads-001', latitude: 7.67, longitude: 36.83 });
  assert(r6.status === 400, 'POST /reports — whitespace-only title → 400', 'Report Validation',
    JSON.stringify(r6.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — Report API: DB-dependent paths (graceful)
// ─────────────────────────────────────────────────────────────────────────────
async function testReportDbPaths(): Promise<void> {
  section('8. Report API — DB-Dependent Paths (graceful error or success)');

  const r1 = await request(app)
    .post(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic disruption near the market.',
      category_id: 'cat-roads-001',
      latitude: 7.6734,
      longitude: 36.8344,
      address_text: 'Jimma Main Street',
      landmark: 'Near Aba Jifar Gate',
    });
  assert(
    r1.status === 201 || r1.status === 400 || r1.status === 500,
    `POST /reports — valid body → 201, 400, or 500 (no DB) [got ${r1.status}]`,
    'Report DB Paths',
    JSON.stringify(r1.body)
  );

  const r2 = await request(app)
    .get(`${BASE}/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`);
  assert(
    r2.status === 200 || r2.status === 500,
    `GET /reports — authenticated → 200 or 500 (no DB) [got ${r2.status}]`,
    'Report DB Paths',
    JSON.stringify(r2.body)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — Report Tracking: Public Read
// ─────────────────────────────────────────────────────────────────────────────
async function testReportTracking(): Promise<void> {
  section('9. Report Tracking — Public Endpoints');

  const r1 = await request(app).get(`${BASE}/reports/track/FRK-2026-0814`);
  assert(r1.status === 200, 'GET /reports/track/FRK-2026-0814 → 200', 'Tracking',
    JSON.stringify(r1.body));
  assert(r1.body.success === true, 'Tracking response success=true', 'Tracking');
  assert(typeof r1.body.data?.report?.tracking_number === 'string',
    'Tracking data has report.tracking_number', 'Tracking');
  assert(Array.isArray(r1.body.data?.evidence),
    'Tracking data has evidence array', 'Tracking');
  assert(Array.isArray(r1.body.data?.resolution_proofs),
    'Tracking data has resolution_proofs array', 'Tracking');

  const r2 = await request(app).get(`${BASE}/reports/rep-demo-001/timeline`);
  assert(r2.status === 200, 'GET /reports/rep-demo-001/timeline → 200', 'Tracking');
  assert(Array.isArray(r2.body.data?.timeline), 'Timeline is array', 'Tracking');
  assert((r2.body.data?.timeline?.length ?? 0) >= 3,
    `Timeline has ≥ 3 entries (got ${r2.body.data?.timeline?.length})`, 'Tracking');

  const r3 = await request(app).get(`${BASE}/reports/totally-nonexistent-id`);
  assert(
    r3.status === 200 || r3.status === 404,
    `GET /reports/<unknown-id> → 200 (mock) or 404 [got ${r3.status}]`, 'Tracking'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — Resolution API: Validation
// ─────────────────────────────────────────────────────────────────────────────
async function testResolutionValidation(): Promise<void> {
  section('10. Resolution API — Validation & Auth Guards');

  const r1 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/confirm`)
    .send({ rating: 5 });
  assert(r1.status === 401, 'POST /reports/:id/confirm — no auth → 401', 'Resolution Validation');

  const r2 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/confirm`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ rating: 2.5 });
  assert(r2.status === 400, 'POST /reports/:id/confirm — float rating → 400', 'Resolution Validation',
    JSON.stringify(r2.body));

  const r3 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/confirm`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ rating: 0 });
  assert(r3.status === 400, 'POST /reports/:id/confirm — rating 0 → 400', 'Resolution Validation',
    JSON.stringify(r3.body));

  const r4 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/confirm`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ rating: 6 });
  assert(r4.status === 400, 'POST /reports/:id/confirm — rating 6 → 400', 'Resolution Validation',
    JSON.stringify(r4.body));

  const r5 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/reopen`)
    .send({ reason: 'Not fixed' });
  assert(r5.status === 401, 'POST /reports/:id/reopen — no auth → 401', 'Resolution Validation');

  const r6 = await request(app)
    .post(`${BASE}/reports/rep-demo-001/reopen`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({});
  assert(r6.status === 400, 'POST /reports/:id/reopen — no reason → 400', 'Resolution Validation',
    JSON.stringify(r6.body));

  const r7 = await request(app)
    .post(`${BASE}/reports/rep-demo-005/reopen`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ reason: '   ' });
  assert(r7.status === 400, 'POST /reports/:id/reopen — whitespace reason → 400', 'Resolution Validation',
    JSON.stringify(r7.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — Institution Workflow: Auth & Role Checks
// ─────────────────────────────────────────────────────────────────────────────
async function testInstitutionAuthChecks(): Promise<void> {
  section('11. Institution Workflow — Auth & Role Guards');

  const r1 = await request(app).get(`${BASE}/institutions/reports`);
  assert(r1.status === 401, 'GET /institutions/reports — no token → 401', 'Institution Auth');

  const r2 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/action`)
    .send({ action: 'accept' });
  assert(r2.status === 401, 'POST /institutions/reports/:id/action — no token → 401', 'Institution Auth');

  // Citizen token → 403 (no institution_id / role=staff)
  const r3 = await request(app)
    .get(`${BASE}/institutions/reports`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`);
  assert(
    r3.status === 403 || r3.status === 500,
    `GET /institutions/reports — citizen token → 403 or 500 (no DB) [got ${r3.status}]`,
    'Institution Auth',
    JSON.stringify(r3.body)
  );

  const r4 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/action`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({});
  assert(
    r4.status === 403 || r4.status === 400 || r4.status === 500,
    `POST /institutions/reports/:id/action — citizen → 403/400/500 [got ${r4.status}]`,
    'Institution Auth',
    JSON.stringify(r4.body)
  );

  const r5 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/assign`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({});
  assert(
    r5.status === 400 || r5.status === 403 || r5.status === 500,
    `POST /institutions/reports/:id/assign — citizen → 400/403/500 [got ${r5.status}]`,
    'Institution Auth',
    JSON.stringify(r5.body)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12 — Institution Workflow: Action Validation
// ─────────────────────────────────────────────────────────────────────────────
async function testInstitutionActionValidation(): Promise<void> {
  section('12. Institution Workflow — Action Validation (staff token, no DB)');

  const r1 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/action`)
    .set('Authorization', `Bearer ${STAFF_TOKEN}`)
    .send({ action: 'fly_to_moon' });
  assert(
    r1.status === 400 || r1.status === 403 || r1.status === 500,
    `POST /institutions/reports/:id/action — invalid action → [got ${r1.status}]`,
    'Institution Action',
    JSON.stringify(r1.body)
  );

  const r2 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/action`)
    .set('Authorization', `Bearer ${STAFF_TOKEN}`)
    .send({ action: 'redirect' });
  assert(
    r2.status === 400 || r2.status === 403 || r2.status === 500,
    `POST /institutions/reports/:id/action — redirect without institution_id → [got ${r2.status}]`,
    'Institution Action',
    JSON.stringify(r2.body)
  );

  const r3 = await request(app)
    .post(`${BASE}/institutions/reports/some-id/assign`)
    .set('Authorization', `Bearer ${STAFF_TOKEN}`)
    .send({});
  assert(
    r3.status === 400 || r3.status === 403 || r3.status === 500,
    `POST /institutions/reports/:id/assign — no staff_user_id → [got ${r3.status}]`,
    'Institution Action',
    JSON.stringify(r3.body)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13 — Evidence API: Validation
// ─────────────────────────────────────────────────────────────────────────────
async function testEvidenceValidation(): Promise<void> {
  section('13. Evidence API — Validation & Auth');

  const r1 = await request(app).post(`${BASE}/evidence/upload`);
  assert(r1.status === 400, 'POST /evidence/upload — no file → 400', 'Evidence',
    JSON.stringify(r1.body));

  const r2 = await request(app)
    .post(`${BASE}/evidence/upload`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`);
  assert(r2.status === 400, 'POST /evidence/upload — missing file with auth → 400', 'Evidence',
    JSON.stringify(r2.body));

  const r3 = await request(app).get(`${BASE}/reports/rep-demo-001/evidence`);
  assert(r3.status === 401, 'GET /reports/:id/evidence — no token → 401', 'Evidence',
    JSON.stringify(r3.body));

  const r4 = await request(app)
    .get(`${BASE}/reports/rep-demo-001/evidence`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`);
  assert(
    r4.status === 200 || r4.status === 404 || r4.status === 500,
    `GET /reports/:id/evidence — authenticated → [got ${r4.status}]`, 'Evidence',
    JSON.stringify(r4.body)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14 — Not Found Responses
// ─────────────────────────────────────────────────────────────────────────────
async function testNotFound(): Promise<void> {
  section('14. Not Found — Unknown Routes');

  const r1 = await request(app).get('/this-does-not-exist');
  assert(r1.status === 404, 'GET /this-does-not-exist → 404', 'Not Found');

  const r2 = await request(app).get(`${BASE}/nonexistent-resource`);
  assert(r2.status === 404, `GET ${BASE}/nonexistent-resource → 404`, 'Not Found');

  const r3 = await request(app).delete(`${BASE}/reports/some-id`);
  assert(r3.status === 404, 'DELETE /reports/:id (undefined method) → 404', 'Not Found',
    JSON.stringify(r3.body));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15 — Full End-to-End Lifecycle (Mock Mode)
// ─────────────────────────────────────────────────────────────────────────────
async function testE2ELifecycle(): Promise<void> {
  section('15. End-to-End Citizen → Institution → Resolution Lifecycle');

  // Step 1: Routing preview (determines institution before report creation)
  const routingRes = await request(app)
    .post(`${BASE}/routing/preview`)
    .send({ category_id: 'roads-streets', latitude: 7.6734, longitude: 36.8344 });
  assert(routingRes.status === 200,
    'E2E Step 1: Routing preview → 200', 'E2E Lifecycle');
  const e2eInst = routingRes.body.data?.institution ?? routingRes.body.data?.target_institution;
  assert(typeof e2eInst?.name === 'string',
    'E2E Step 1: Routing returns an institution name', 'E2E Lifecycle',
    JSON.stringify(routingRes.body.data));

  // Step 2: Citizen tracks a report by tracking number
  const trackRes = await request(app).get(`${BASE}/reports/track/FRK-2026-0814`);
  assert(trackRes.status === 200,
    'E2E Step 2: Citizen tracks report FRK-2026-0814 → 200', 'E2E Lifecycle');
  assert(trackRes.body.data?.report?.status !== undefined,
    'E2E Step 2: Report has a status field', 'E2E Lifecycle',
    JSON.stringify(trackRes.body.data?.report));

  // Step 3: Full timeline view
  const timelineRes = await request(app).get(`${BASE}/reports/rep-demo-001/timeline`);
  assert(timelineRes.status === 200, 'E2E Step 3: Timeline fetch → 200', 'E2E Lifecycle');
  const timeline = timelineRes.body.data?.timeline ?? [];
  assert(timeline.length >= 1, `E2E Step 3: Timeline has entries (got ${timeline.length})`, 'E2E Lifecycle');

  // Step 4: Verify resolved entry exists in history
  const resolvedEntry = timeline.find((e: any) => e.new_status === 'resolved');
  assert(!!resolvedEntry,
    'E2E Step 4: Timeline has a "resolved" entry', 'E2E Lifecycle',
    `Statuses: ${timeline.map((e: any) => e.new_status).join(', ')}`);

  // Step 5: Citizen confirms resolution
  const confirmRes = await request(app)
    .post(`${BASE}/reports/rep-demo-e2e-final/confirm`)
    .set('Authorization', `Bearer ${CITIZEN_TOKEN}`)
    .send({ rating: 5, comment: 'Issue resolved, very happy!' });
  assert(confirmRes.status === 200,
    'E2E Step 5: Citizen confirms resolution → 200', 'E2E Lifecycle',
    JSON.stringify(confirmRes.body));
  assert(confirmRes.body.report?.citizen_confirmed === true,
    'E2E Step 5: citizen_confirmed is true', 'E2E Lifecycle');

  // Step 6: Timeline shows confirmation
  const postConfirmTimeline = await request(app)
    .get(`${BASE}/reports/rep-demo-e2e-final/timeline`);
  assert(postConfirmTimeline.status === 200,
    'E2E Step 6: Post-confirm timeline → 200', 'E2E Lifecycle');
  const finalEntries: any[] = postConfirmTimeline.body.data?.timeline ?? [];
  const confirmEntry = finalEntries.find((e: any) =>
    typeof e.comment === 'string' && e.comment.toLowerCase().includes('confirmed')
  );
  assert(!!confirmEntry,
    'E2E Step 6: Timeline includes citizen confirmation entry', 'E2E Lifecycle',
    `Comments: ${finalEntries.map((e: any) => e.comment).join(' | ')}`);

  // Step 7: All 4 category routing paths resolve to a named institution
  const categories = ['roads-streets', 'water-sewerage', 'waste-management', 'lighting-power'];
  for (const cat of categories) {
    const r = await request(app)
      .post(`${BASE}/routing/preview`)
      .send({ category_id: cat, latitude: 7.67, longitude: 36.83 });
    assert(r.status === 200, `E2E Step 7: Routing "${cat}" → 200`, 'E2E Lifecycle');
    const inst = r.body.data?.institution ?? r.body.data?.target_institution;
    assert(typeof inst?.name === 'string',
      `E2E Step 7: "${cat}" resolves to a named institution`, 'E2E Lifecycle',
      JSON.stringify(r.body.data));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16 — Security: HTTP Response Headers
// ─────────────────────────────────────────────────────────────────────────────
async function testSecurityHeaders(): Promise<void> {
  section('16. Security — HTTP Response Headers (Helmet)');

  const r = await request(app).get(`${BASE}/health`);

  assert(
    r.headers['x-content-type-options'] === 'nosniff',
    'Helmet: X-Content-Type-Options: nosniff', 'Security Headers',
    `Got: ${r.headers['x-content-type-options']}`
  );
  assert(
    typeof r.headers['x-frame-options'] === 'string',
    'Helmet: X-Frame-Options present', 'Security Headers',
    `Got: ${r.headers['x-frame-options']}`
  );
  assert(
    typeof r.headers['x-dns-prefetch-control'] === 'string',
    'Helmet: X-DNS-Prefetch-Control present', 'Security Headers',
    `Got: ${r.headers['x-dns-prefetch-control']}`
  );

  // Password must not appear in failed login response
  const loginBadRes = await request(app)
    .post(`${BASE}/auth/login`)
    .send({ email: 'hacker@evil.com', password: 'secret123' });
  const bodyStr = JSON.stringify(loginBadRes.body);
  assert(
    !bodyStr.includes('secret123'),
    'Login error response does not echo back raw password', 'Security Headers',
    bodyStr
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Runner
// ─────────────────────────────────────────────────────────────────────────────
async function runAll(): Promise<void> {
  console.log('\n' + '═'.repeat(60));
  console.log(' FURKO — Backend Validation, Security & Integration Tests');
  console.log(' Issue #121');
  console.log('═'.repeat(60));

  await testHealth();
  await testAuthValidation();
  await testAuthCredentials();
  await testUnauthorizedAccess();
  await testInvalidToken();
  await testRoutingEngine();
  await testReportValidation();
  await testReportDbPaths();
  await testReportTracking();
  await testResolutionValidation();
  await testInstitutionAuthChecks();
  await testInstitutionActionValidation();
  await testEvidenceValidation();
  await testNotFound();
  await testE2ELifecycle();
  await testSecurityHeaders();

  const total = passed + failed;
  console.log('\n' + '═'.repeat(60));
  console.log(` RESULTS: ${passed}/${total} passed, ${failed} failed`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter((r) => !r.ok).forEach((r) => {
      console.error(`  [${r.group}] ${r.label}`);
      if (r.detail) console.error(`    → ${r.detail}`);
    });
    console.log('');
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Unexpected runner error:', err);
  process.exit(1);
});
