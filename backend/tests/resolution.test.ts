/**
 * tests/resolution.test.ts
 * Report Tracking and Resolution API — Issue #120
 * Run: npx tsx tests/resolution.test.ts
 */

import request from 'supertest';
import app from '../src/app';

// ---------------------------------------------------------------------------
// Helper: build a minimal Bearer token that passes verifyToken in test mode.
// verifyToken only checks process.env.JWT_SECRET; we sign a payload manually.
// ---------------------------------------------------------------------------
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';
const CITIZEN_ID = 'usr-demo-001';

function makeToken(userId = CITIZEN_ID): string {
  return jwt.sign({ userId, role: 'citizen' }, TEST_SECRET, { expiresIn: '1h' });
}

// ---------------------------------------------------------------------------
// Test counters
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    console.log(`  ✅  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL: ${label}${detail ? `\n       → ${detail}` : ''}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
async function runTests(): Promise<void> {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log(' FURKO — Report Tracking & Resolution API Test Suite #120');
  console.log('══════════════════════════════════════════════════════════\n');

  // ─────────────────────────────────────────────────────────────────────────
  // 1. GET /api/v1/reports/track/:trackingNumber — public timeline by tracking#
  // ─────────────────────────────────────────────────────────────────────────
  console.log('TEST 1: GET /api/v1/reports/track/FRK-2026-0814 (public)');
  {
    const res = await request(app)
      .get('/api/v1/reports/track/FRK-2026-0814')
      .expect((r) => {
        // Accept 200 (mock found) or 404 (no DB, identifier not in mock store)
        // Our mock matches tracking numbers, so expect 200
      });

    assert(res.status === 200, '200 OK for known tracking number');
    assert(
      res.body.success === true,
      'Response has success=true',
      JSON.stringify(res.body)
    );
    assert(
      !!res.body.data?.report,
      'Response body contains data.report',
      JSON.stringify(res.body.data)
    );
    assert(
      Array.isArray(res.body.data?.timeline),
      'Response body contains data.timeline array',
      JSON.stringify(res.body.data?.timeline)
    );
    assert(
      Array.isArray(res.body.data?.evidence),
      'Response body contains data.evidence array'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET /api/v1/reports/:id/timeline — timeline by report ID
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 2: GET /api/v1/reports/rep-demo-001/timeline');
  {
    const res = await request(app).get('/api/v1/reports/rep-demo-001/timeline');

    assert(res.status === 200, '200 OK for known demo report id');
    assert(res.body.success === true, 'Response has success=true');
    assert(
      Array.isArray(res.body.data?.timeline),
      'Timeline is an array',
      JSON.stringify(res.body.data?.timeline)
    );
    const timelineLength = res.body.data?.timeline?.length ?? 0;
    assert(timelineLength >= 1, `Timeline has at least 1 entry (got ${timelineLength})`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GET /api/v1/reports/:id — full resolution details
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 3: GET /api/v1/reports/rep-demo-001 (full resolution details)');
  {
    const res = await request(app).get('/api/v1/reports/rep-demo-001');

    assert(res.status === 200, '200 OK');
    assert(res.body.success === true, 'success=true');
    assert(
      typeof res.body.data?.report?.tracking_number === 'string',
      'Report has tracking_number',
      JSON.stringify(res.body.data?.report)
    );
    assert(
      typeof res.body.data?.report?.resolution_information === 'string' ||
        res.body.data?.report?.resolution_information == null,
      'resolution_information is string or null'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. POST /api/v1/reports/:id/confirm — no auth → 401
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 4: POST /api/v1/reports/rep-demo-001/confirm — no auth → 401');
  {
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-001/confirm')
      .send({ rating: 5, comment: 'Great job!' });

    assert(res.status === 401, `401 Unauthorized without token (got ${res.status})`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. POST /api/v1/reports/:id/confirm — invalid rating → 400
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 5: POST /api/v1/reports/rep-demo-001/confirm — invalid rating → 400');
  {
    const token = makeToken();
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-001/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 9 }); // invalid: > 5

    assert(
      res.status === 400,
      `400 Bad Request for out-of-range rating (got ${res.status})`
    );
    const errMsg: string = res.body?.error?.message || '';
    assert(
      errMsg.toLowerCase().includes('rating'),
      `Error message mentions "rating" (got: "${errMsg}")`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. POST /api/v1/reports/:id/reopen — missing reason → 400
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 6: POST /api/v1/reports/rep-demo-001/reopen — missing reason → 400');
  {
    const token = makeToken();
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-001/reopen')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // missing reason

    assert(
      res.status === 400,
      `400 Bad Request when reason is missing (got ${res.status})`
    );
    const errMsg: string = res.body?.error?.message || '';
    assert(
      errMsg.toLowerCase().includes('reason'),
      `Error message mentions "reason" (got: "${errMsg}")`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. POST /api/v1/reports/:id/confirm — mock-mode confirm → 200
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 7: POST /api/v1/reports/rep-demo-001/confirm — mock confirm → 200');
  {
    const token = makeToken();
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-001/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Fixed quickly, satisfied.' });

    assert(
      res.status === 200,
      `200 OK on mock confirm (got ${res.status})\n       Body: ${JSON.stringify(res.body)}`
    );
    assert(
      res.body.success === true,
      'success=true'
    );
    assert(
      res.body.report?.citizen_confirmed === true,
      `citizen_confirmed is true (got: ${res.body.report?.citizen_confirmed})`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. POST /api/v1/reports/:id/reopen — mock-mode reopen → 200
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 8: POST /api/v1/reports/rep-demo-002/reopen — mock reopen → 200');
  {
    // Use a fresh demo report ID so state isn't affected by test 7's confirm
    const token = makeToken();
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-002/reopen')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'The pothole appeared again after rain.' });

    assert(
      res.status === 200,
      `200 OK on mock reopen (got ${res.status})\n       Body: ${JSON.stringify(res.body)}`
    );
    assert(
      res.body.success === true,
      'success=true'
    );
    assert(
      res.body.report?.status === 'reopened',
      `status is "reopened" (got: "${res.body.report?.status}")`
    );
    assert(
      typeof res.body.report?.reopen_reason === 'string',
      `reopen_reason is a string (got: "${res.body.report?.reopen_reason}")`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. PATCH /api/v1/reports/:id/reopen — PATCH verb also works → 200
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 9: PATCH /api/v1/reports/rep-demo-003/reopen — PATCH verb → 200');
  {
    const token = makeToken();
    const res = await request(app)
      .patch('/api/v1/reports/rep-demo-003/reopen')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Still unresolved after marked done.' });

    assert(
      res.status === 200,
      `200 OK with PATCH verb (got ${res.status})`
    );
    assert(res.body.success === true, 'success=true');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. POST /api/v1/reports/:id/reopen — no auth → 401
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nTEST 10: POST /api/v1/reports/rep-demo-001/reopen — no auth → 401');
  {
    const res = await request(app)
      .post('/api/v1/reports/rep-demo-001/reopen')
      .send({ reason: 'Still broken.' });

    assert(
      res.status === 401,
      `401 Unauthorized without token (got ${res.status})`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Results
  // ─────────────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════════');
  console.log(` Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unexpected error running tests:', err);
  process.exit(1);
});
