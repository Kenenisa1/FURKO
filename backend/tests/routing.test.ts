import request from 'supertest';
import { createApp } from '../src/app';
import { RoutingService } from '../src/services/routing';

const app = createApp();

async function runRoutingTests() {
  console.log('--- Starting Rule-Based Report Routing Engine Tests ---');
  let passed = 0;
  let total = 0;

  // Test 1: Category matching (Roads & Streets -> Jimma Road Bureau)
  total++;
  try {
    const decision = await RoutingService.determineRouting({
      category_id: 'cat-roads-001',
      latitude: 7.6734,
      longitude: 36.8344,
    });

    if (
      decision.target_institution.name === 'Jimma City Road & Infrastructure Development Bureau' &&
      decision.confidence === 'direct_boundary_match' &&
      !decision.is_fallback
    ) {
      console.log('✅ Test 1 Passed: Correctly routed Roads report in Central District to Road Bureau');
      passed++;
    } else {
      console.error('❌ Test 1 Failed:', decision);
    }
  } catch (e: any) {
    console.error('❌ Test 1 Error:', e.message);
  }

  // Test 2: Category matching with UUID (Water & Sewerage -> Water Bureau)
  total++;
  try {
    const decision = await RoutingService.determineRouting({
      category_id: '8c4c0c53-2567-4d39-cc99-459908347e33',
      latitude: 7.6789,
      longitude: 36.8312,
    });

    if (
      decision.target_institution.name === 'Jimma City Water & Sewerage Authority' &&
      !decision.is_fallback
    ) {
      console.log('✅ Test 2 Passed: Correctly routed Water report by UUID to Water Authority');
      passed++;
    } else {
      console.error('❌ Test 2 Failed:', decision);
    }
  } catch (e: any) {
    console.error('❌ Test 2 Error:', e.message);
  }

  // Test 3: Electric Power category (EEU Jimma Branch)
  total++;
  try {
    const decision = await RoutingService.determineRouting({
      category_id: 'lighting-power',
      latitude: 7.6721,
      longitude: 36.8358,
    });

    if (
      decision.target_institution.code === 'EEU-JB' &&
      !decision.is_fallback
    ) {
      console.log('✅ Test 3 Passed: Correctly routed Lighting report by slug to EEU Jimma');
      passed++;
    } else {
      console.error('❌ Test 3 Failed:', decision);
    }
  } catch (e: any) {
    console.error('❌ Test 3 Error:', e.message);
  }

  // Test 4: Out-of-bounds geographic coordinates -> Fallback review queue
  total++;
  try {
    const decision = await RoutingService.determineRouting({
      category_id: 'cat-roads-001',
      latitude: 9.0320, // Addis Ababa coordinates (outside Jimma)
      longitude: 38.7480,
    });

    if (
      decision.is_fallback === true &&
      decision.confidence === 'fallback_review_queue' &&
      decision.target_institution.code === 'JCCM-FALLBACK'
    ) {
      console.log('✅ Test 4 Passed: Out-of-bounds report dispatched to Fallback Review Queue');
      passed++;
    } else {
      console.error('❌ Test 4 Failed:', decision);
    }
  } catch (e: any) {
    console.error('❌ Test 4 Error:', e.message);
  }

  // Test 5: Unknown/unmapped problem category -> Fallback review queue
  total++;
  try {
    const decision = await RoutingService.determineRouting({
      category_id: 'unknown-alien-issue-999',
      latitude: 7.6734,
      longitude: 36.8344,
    });

    if (
      decision.is_fallback === true &&
      decision.confidence === 'fallback_review_queue' &&
      decision.target_institution.code === 'JCCM-FALLBACK'
    ) {
      console.log('✅ Test 5 Passed: Unknown category dispatched to Fallback Review Queue');
      passed++;
    } else {
      console.error('❌ Test 5 Failed:', decision);
    }
  } catch (e: any) {
    console.error('❌ Test 5 Error:', e.message);
  }

  // Test 6: API endpoint POST /api/v1/routing/preview without category_id -> 400
  total++;
  try {
    const res = await request(app)
      .post('/api/v1/routing/preview')
      .send({ latitude: 7.67 });

    if (res.status === 400 && res.body.success === false) {
      console.log('✅ Test 6 Passed: Missing category_id returned 400 Bad Request');
      passed++;
    } else {
      console.error('❌ Test 6 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 6 Error:', e.message);
  }

  // Test 7: API endpoint POST /api/v1/routing/preview valid request -> 200 with decision & reason
  total++;
  try {
    const res = await request(app)
      .post('/api/v1/routing/preview')
      .send({
        category_id: 'cat-waste-003',
        latitude: 7.6698,
        longitude: 36.8399,
        address_text: 'Hermata Market area',
      });

    if (
      res.status === 200 &&
      res.body.success === true &&
      res.body.data.target_institution.code === 'JCSWMO' &&
      res.body.data.routing_reason.length > 0
    ) {
      console.log('✅ Test 7 Passed: HTTP POST /api/v1/routing/preview returned 200 with institution & reason');
      passed++;
    } else {
      console.error('❌ Test 7 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 7 Error:', e.message);
  }

  // Test 8: API endpoint GET /api/v1/routing/institutions -> 200 list
  total++;
  try {
    const res = await request(app).get('/api/v1/routing/institutions');
    if (res.status === 200 && res.body.success === true && Array.isArray(res.body.data) && res.body.data.length >= 5) {
      console.log('✅ Test 8 Passed: GET /api/v1/routing/institutions returned active institutions list');
      passed++;
    } else {
      console.error('❌ Test 8 Failed:', res.status, res.body);
    }
  } catch (e: any) {
    console.error('❌ Test 8 Error:', e.message);
  }

  console.log(`\nResults: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('🎉 All routing engine test suites passed!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRoutingTests();
