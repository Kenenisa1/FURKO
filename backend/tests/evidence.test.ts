import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createApp } from '../src/app';

const app = createApp();

async function runTests() {
  console.log('--- Starting Evidence & Report Photo API Tests ---');
  let passed = 0;
  let total = 0;

  const testFileDir = path.resolve(__dirname, 'temp_test_files');
  if (!fs.existsSync(testFileDir)) {
    fs.mkdirSync(testFileDir, { recursive: true });
  }
  const validImagePath = path.join(testFileDir, 'test-photo.jpg');
  fs.writeFileSync(validImagePath, Buffer.from('fake image content jpg 12345'));

  const invalidTextPath = path.join(testFileDir, 'test-doc.txt');
  fs.writeFileSync(invalidTextPath, 'this is a plain text file, not an image');

  // Test 1: Upload without file -> 400
  total++;
  try {
    const res = await request(app).post('/api/v1/evidence/upload');
    if (res.status === 400 && res.body.success === false) {
      console.log('✅ Test 1 Passed: Missing file returns 400 Bad Request');
      passed++;
    } else {
      console.error('❌ Test 1 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 1 Error:', e.message);
  }

  // Test 2: Upload invalid file type -> 400
  total++;
  try {
    const res = await request(app)
      .post('/api/v1/evidence/upload')
      .attach('file', invalidTextPath);
    if (res.status === 400 && res.body.success === false && res.body.error.message.includes('Invalid file type')) {
      console.log('✅ Test 2 Passed: Invalid file type rejected with 400 Bad Request');
      passed++;
    } else {
      console.error('❌ Test 2 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 2 Error:', e.message);
  }

  // Test 3: Upload valid evidence image -> 201 Created with URL and metadata
  total++;
  let uploadedEvidenceId = '';
  let uploadedFileUrl = '';
  try {
    const res = await request(app)
      .post('/api/v1/evidence/upload')
      .attach('file', validImagePath)
      .field('file_type', 'evidence');

    if (res.status === 201 && res.body.success === true && res.body.data.file_url) {
      uploadedEvidenceId = res.body.data.id;
      uploadedFileUrl = res.body.data.file_url;
      console.log('✅ Test 3 Passed: Valid image upload returned 201 with URL:', uploadedFileUrl);
      passed++;
    } else {
      console.error('❌ Test 3 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 3 Error:', e.message);
  }

  // Test 4: Upload with invalid report ID format -> 400
  total++;
  try {
    const res = await request(app)
      .post('/api/v1/evidence/upload')
      .attach('file', validImagePath)
      .field('report_id', 'invalid-non-uuid-format-12345');

    if (res.status === 400 && res.body.success === false && res.body.error.message.includes('Invalid report_id format')) {
      console.log('✅ Test 4 Passed: Invalid report_id format rejected with 400');
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 4 Error:', e.message);
  }

  // Test 5: Upload directly for a report via /api/v1/reports/:id/evidence
  total++;
  const sampleReportId = 'rep-demo-001';
  const jwt = await import('jsonwebtoken');
  const token = jwt.default.sign({ userId: 'usr-demo-001', role: 'citizen' }, process.env.JWT_SECRET || 'super_secret_fallback_key', { expiresIn: '1h' });
  try {
    const res = await request(app)
      .post(`/api/v1/reports/${sampleReportId}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('evidence', validImagePath);

    if (res.status === 201 && res.body.success === true && res.body.data.report_id === sampleReportId) {
      console.log('✅ Test 5 Passed: Evidence uploaded and associated with report');
      passed++;
    } else {
      console.error('❌ Test 5 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 5 Error:', e.message);
  }

  // Test 6: Query evidence attachments for a report
  total++;
  try {
    const res = await request(app)
      .get(`/api/v1/reports/${sampleReportId}/evidence`)
      .set('Authorization', `Bearer ${token}`);
    if (res.status === 200 && res.body.success === true && Array.isArray(res.body.data)) {
      console.log('✅ Test 6 Passed: Retrieved attachments list for report');
      passed++;
    } else {
      console.error('❌ Test 6 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 6 Error:', e.message);
  }

  // Cleanup temp files
  try {
    fs.rmSync(testFileDir, { recursive: true, force: true });
  } catch {}

  console.log(`\nResults: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('🎉 All evidence upload API test suites passed!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
