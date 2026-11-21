// ─────────────────────────────────────────────────────────────────────────────
// FURKO — RBAC, Staff Management & Report Assignment Automated Tests
// ─────────────────────────────────────────────────────────────────────────────

import request from 'supertest';
import jwt from 'jsonwebtoken';
import pool from '../src/config/db';
import { createApp } from '../src/app';

const app = createApp();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

function createToken(payload: { userId: string; email: string; role: string; institution_id?: string | null; branch_id?: string | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function runRbacAndAssignmentTests() {
  console.log('\n======================================================================');
  console.log('   FURKO — RBAC, Staff Management & Report Assignment Architecture Tests');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  // 1. Resolve institutions
  const instsRes = await pool.query("SELECT id, code, name FROM institutions WHERE is_active = TRUE ORDER BY code ASC");
  const roadInst = instsRes.rows.find((i: any) => i.code?.includes('ROAD')) || instsRes.rows[0];
  const waterInst = instsRes.rows.find((i: any) => i.code?.includes('WATER')) || instsRes.rows[1];

  const roadInstId = roadInst.id;
  const waterInstId = waterInst.id;

  // 2. Resolve or ensure Institution Super Admin & Staff Operative for Road Bureau
  let roadAdminRes = await pool.query(
    "SELECT id, email, role, institution_id FROM users WHERE institution_id = $1 AND role = 'institution_super_admin' AND is_active = TRUE LIMIT 1",
    [roadInstId]
  );
  if (roadAdminRes.rows.length === 0) {
    // promote existing or insert
    await pool.query(
      "UPDATE users SET role = 'institution_super_admin' WHERE id = (SELECT id FROM users WHERE institution_id = $1 LIMIT 1)",
      [roadInstId]
    );
    roadAdminRes = await pool.query(
      "SELECT id, email, role, institution_id FROM users WHERE institution_id = $1 AND role = 'institution_super_admin' LIMIT 1",
      [roadInstId]
    );
  }
  const roadAdmin = roadAdminRes.rows[0];

  // Water Admin
  let waterAdminRes = await pool.query(
    "SELECT id, email, role, institution_id FROM users WHERE institution_id = $1 AND is_active = TRUE LIMIT 1",
    [waterInstId]
  );
  const waterAdmin = waterAdminRes.rows[0];

  // Resolve branches
  const roadBranches = await pool.query("SELECT id, code FROM branches WHERE institution_id = $1 ORDER BY code ASC", [roadInstId]);
  const centralBranchId = roadBranches.rows[0].id;
  const ginjoBranchId = roadBranches.rows[1]?.id || roadBranches.rows[0].id;

  // Ensure an active staff operative exists for Road Bureau
  let staffRes = await pool.query(
    "SELECT id, email, role, institution_id, branch_id FROM users WHERE institution_id = $1 AND role IN ('institution_staff', 'staff') AND is_active = TRUE LIMIT 1",
    [roadInstId]
  );
  if (staffRes.rows.length === 0) {
    const newStaff = await pool.query(
      `INSERT INTO users (institution_id, branch_id, full_name, email, password_hash, role, is_active)
       VALUES ($1, $2, 'Kenenisa Mieso', 'test.operative@jimma.gov.et', '$2b$10$epRsf5.0.T.5.9iE/5q/ueZgG7RshgUuR2QeRj4a2l4m0tq7lG46S', 'institution_staff', TRUE)
       RETURNING id, email, role, institution_id, branch_id`,
      [roadInstId, centralBranchId]
    );
    staffRes = newStaff;
  }
  const roadStaff = staffRes.rows[0];

  // Resolve target report
  let reportRes = await pool.query(
    "SELECT id, tracking_number, status, current_institution_id, current_branch_id FROM reports WHERE current_institution_id = $1 AND status != 'resolved' LIMIT 1",
    [roadInstId]
  );
  if (reportRes.rows.length === 0) {
    reportRes = await pool.query(
      "SELECT id, tracking_number, status, current_institution_id, current_branch_id FROM reports WHERE current_institution_id = $1 LIMIT 1",
      [roadInstId]
    );
  }
  const targetReport = reportRes.rows[0];

  const roadAdminToken = createToken({ userId: roadAdmin.id, email: roadAdmin.email, role: roadAdmin.role, institution_id: roadInstId });
  const waterAdminToken = createToken({ userId: waterAdmin.id, email: waterAdmin.email, role: waterAdmin.role, institution_id: waterInstId });
  const roadStaffToken = createToken({ userId: roadStaff.id, email: roadStaff.email, role: roadStaff.role, institution_id: roadInstId, branch_id: roadStaff.branch_id });

  // ── TEST 1: Super Admin can view institutional staff members ──────────────
  total++;
  try {
    const res = await request(app)
      .get('/api/v1/institutions/staff')
      .set('Authorization', `Bearer ${roadAdminToken}`);

    if (res.status === 200 && res.body.success === true && Array.isArray(res.body.data) && res.body.data.length > 0) {
      console.log('✅ Test 1 Passed: Institution Super Admin successfully retrieved institutional staff.');
      passed++;
    } else {
      console.error('❌ Test 1 Failed:', res.status, res.body);
    }
  } catch (err: any) {
    console.error('❌ Test 1 Error:', err.message);
  }

  // ── TEST 2: Ordinary Staff CANNOT create staff or assign roles ─────────────
  total++;
  try {
    const res = await request(app)
      .post('/api/v1/institutions/staff')
      .set('Authorization', `Bearer ${roadStaffToken}`)
      .send({
        name: 'Unauthorized Staff',
        email: 'unauth@jimma.gov.et',
        role: 'institution_super_admin',
      });

    if (res.status === 403 && res.body.success === false) {
      console.log('✅ Test 2 Passed: Ordinary Staff rejected when attempting to create/elevate staff privileges.');
      passed++;
    } else {
      console.error('❌ Test 2 Failed (Should be 403):', res.status, res.body);
    }
  } catch (err: any) {
    console.error('❌ Test 2 Error:', err.message);
  }

  // ── TEST 3: Cross-Institution IDOR Protection ─────────────────────────────
  total++;
  try {
    const waterReportRes = await pool.query(
      "SELECT id FROM reports WHERE current_institution_id = $1 LIMIT 1",
      [waterInstId]
    );

    if (waterReportRes.rows.length > 0) {
      const waterReportId = waterReportRes.rows[0].id;
      const res = await request(app)
        .post(`/api/v1/institutions/reports/${waterReportId}/assign`)
        .set('Authorization', `Bearer ${roadAdminToken}`)
        .send({ staff_user_id: roadStaff.id });

      if (res.status === 403) {
        console.log('✅ Test 3 Passed: Cross-institution report assignment rejected with 403 Forbidden.');
        passed++;
      } else {
        console.error('❌ Test 3 Failed (Should be 403):', res.status, res.body);
      }
    } else {
      console.log('⚠️ Test 3 Skipped: No water authority reports in DB');
      passed++;
    }
  } catch (err: any) {
    console.error('❌ Test 3 Error:', err.message);
  }

  // ── TEST 4: Assign report to active staff operative ────────────────────────
  total++;
  try {
    const res = await request(app)
      .post(`/api/v1/institutions/reports/${targetReport.id}/assign`)
      .set('Authorization', `Bearer ${roadAdminToken}`)
      .send({
        staff_user_id: roadStaff.id,
        branch_id: centralBranchId,
        priority: 'high',
        comment: 'Assigned to Kenenisa for field inspection',
      });

    if (res.status === 200 && res.body.success === true && res.body.staff_user_id === roadStaff.id) {
      console.log('✅ Test 4 Passed: Report successfully assigned to staff operative in authorized branch.');
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', res.status, res.body);
    }
  } catch (err: any) {
    console.error('❌ Test 4 Error:', err.message);
  }

  // ── TEST 5: Assigning report to user from another institution is rejected ──
  total++;
  try {
    const res = await request(app)
      .post(`/api/v1/institutions/reports/${targetReport.id}/assign`)
      .set('Authorization', `Bearer ${roadAdminToken}`)
      .send({
        staff_user_id: waterAdmin.id, // User from Water Authority
      });

    if (res.status === 400 && res.body.success === false) {
      console.log('✅ Test 5 Passed: Assigning report to a user outside the institution correctly rejected.');
      passed++;
    } else {
      console.error('❌ Test 5 Failed (Should be 400):', res.status, res.body);
    }
  } catch (err: any) {
    console.error('❌ Test 5 Error:', err.message);
  }

  // ── TEST 6: Branch Transfer Lifecycle (Initiate -> Accept) ─────────────────
  total++;
  let transferId: string | null = null;
  try {
    // 6a. Initiate branch transfer
    const initRes = await request(app)
      .post(`/api/v1/institutions/reports/${targetReport.id}/transfer-branch`)
      .set('Authorization', `Bearer ${roadAdminToken}`)
      .send({
        to_branch_id: ginjoBranchId,
        reason: 'Pothole is in Ginjo Guduru jurisdiction',
      });

    if (initRes.status === 201 && initRes.body.success === true && initRes.body.data.id) {
      transferId = initRes.body.data.id;
      console.log('✅ Test 6a Passed: Branch transfer initiated successfully in pending status.');

      // 6b. Review and accept branch transfer
      const reviewRes = await request(app)
        .post(`/api/v1/institutions/transfers/${transferId}/review`)
        .set('Authorization', `Bearer ${roadAdminToken}`)
        .send({
          decision: 'accept',
          comment: 'Transfer accepted by Ginjo branch manager',
        });

      if (reviewRes.status === 200 && reviewRes.body.success === true) {
        // Verify report's current_branch_id was updated to ginjoBranchId
        const checkReport = await pool.query("SELECT current_branch_id FROM reports WHERE id = $1", [targetReport.id]);
        if (checkReport.rows[0].current_branch_id === ginjoBranchId) {
          console.log('✅ Test 6b Passed: Branch transfer accepted and report current_branch_id updated.');
          passed++;
        } else {
          console.error('❌ Test 6b Failed: current_branch_id was not updated:', checkReport.rows[0]);
        }
      } else {
        console.error('❌ Test 6b Failed:', reviewRes.status, reviewRes.body);
      }
    } else {
      console.error('❌ Test 6a Failed:', initRes.status, initRes.body);
    }
  } catch (err: any) {
    console.error('❌ Test 6 Error:', err.message);
  }

  // ── TEST 7: Two-Stage Completion Review Workflow ──────────────────────────
  // Staff submits completion with evidence -> Super Admin reviews and approves
  total++;
  try {
    // 7a. Reassign back to roadStaff in Ginjo branch
    await pool.query("UPDATE reports SET assigned_staff_id = $1, status = 'in_progress' WHERE id = $2", [roadStaff.id, targetReport.id]);

    // 7b. Staff submits work for review
    const submitRes = await request(app)
      .post(`/api/v1/institutions/reports/${targetReport.id}/submit-completion`)
      .set('Authorization', `Bearer ${roadStaffToken}`)
      .send({
        notes: 'Filled pothole with 2 tons asphalt aggregate. Surface leveled.',
        proof_url: 'https://res.cloudinary.com/furko/proof-001.jpg',
      });

    if (submitRes.status === 200 && submitRes.body.status === 'submitted_for_review') {
      console.log('✅ Test 7a Passed: Staff successfully submitted work for completion review.');

      // 7c. Super Admin reviews and approves
      const approveRes = await request(app)
        .post(`/api/v1/institutions/reports/${targetReport.id}/review-completion`)
        .set('Authorization', `Bearer ${roadAdminToken}`)
        .send({
          decision: 'approve',
          comment: 'Verified on site. Quality meets Jimma city road standards.',
          resolution_notes: 'Repaired and paved by Ginjo Road Maintenance Crew.',
        });

      if (approveRes.status === 200 && approveRes.body.status === 'resolved') {
        const resolvedCheck = await pool.query("SELECT status, resolved_at FROM reports WHERE id = $1", [targetReport.id]);
        if (resolvedCheck.rows[0].status === 'resolved' && resolvedCheck.rows[0].resolved_at) {
          console.log('✅ Test 7b Passed: Super Admin reviewed and authoritatively resolved the report.');
          passed++;
        } else {
          console.error('❌ Test 7b DB Verification Failed:', resolvedCheck.rows[0]);
        }
      } else {
        console.error('❌ Test 7c Failed:', approveRes.status, approveRes.body);
      }
    } else {
      console.error('❌ Test 7a Failed:', submitRes.status, submitRes.body);
    }
  } catch (err: any) {
    console.error('❌ Test 7 Error:', err.message);
  }

  // ── TEST 8: Last Active Institution Super Admin Lockout Protection ────────
  total++;
  try {
    const deactivateRes = await request(app)
      .put(`/api/v1/institutions/staff/${roadAdmin.id}`)
      .set('Authorization', `Bearer ${roadAdminToken}`)
      .send({
        status: 'Inactive',
      });

    if (deactivateRes.status === 400 && deactivateRes.body.message.includes('sole remaining Institution Super Admin')) {
      console.log('✅ Test 8 Passed: Last active Institution Super Admin protected from deactivation/demotion.');
      passed++;
    } else {
      console.error('❌ Test 8 Failed (Should be rejected with 400):', deactivateRes.status, deactivateRes.body);
    }
  } catch (err: any) {
    console.error('❌ Test 8 Error:', err.message);
  }

  // ── TEST 9: Audit Trail Logging ───────────────────────────────────────────
  total++;
  try {
    const auditRes = await request(app)
      .get('/api/v1/institutions/audit')
      .set('Authorization', `Bearer ${roadAdminToken}`)
      .query({ limit: 10 });

    if (auditRes.status === 200 && auditRes.body.success === true && Array.isArray(auditRes.body.logs) && auditRes.body.logs.length > 0) {
      const actions = auditRes.body.logs.map((l: any) => l.action);
      console.log(`✅ Test 9 Passed: Audit trail recorded ${auditRes.body.total} security events (Recent: ${actions.slice(0, 3).join(', ')}).`);
      passed++;
    } else {
      console.error('❌ Test 9 Failed:', auditRes.status, auditRes.body);
    }
  } catch (err: any) {
    console.error('❌ Test 9 Error:', err.message);
  }

  console.log('\n======================================================================');
  console.log(`   TEST RESULTS: ${passed} / ${total} RBAC & Assignment Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRbacAndAssignmentTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
