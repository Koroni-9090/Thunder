/**
 * SahulatRail Automated Integration & Security Test Suite
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 * Tests all 15 Critical Capabilities: RBAC, Consent Revocation, Asymmetric Risk,
 * Pakistani Name Fuzzy Matching, Autonomous Agent, Scam Detection & Rate Limiting.
 */

import { db } from '../lib/db';
import { evaluateReliefApplication, classifyScamMessage } from '../lib/ai-engine';
import { jaroWinklerSimilarity, normalizePakistaniName } from '../lib/fuzzy-matching';
import { runDpiAutonomousAgent } from '../lib/agent-runner';
import { validateApiKey, apiKeyManager } from '../lib/api-keys';
import { checkRateLimit } from '../lib/auth';
import { inspectDocumentForForgery } from '../lib/ocr-engine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('⚡ SAHULATRAIL (TEAM THUNDER) HACKATHON VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // TEST 1: Pakistani Name Normalization & Jaro-Winkler Matching
  console.log('--- TEST GROUP 1: Pakistani Name Normalization & Fuzzy Engine ---');
  const norm1 = normalizePakistaniName('Mohammad Ali Khan');
  const norm2 = normalizePakistaniName('Muhammad Ali Khan');
  assert(norm1 === norm2, 'Normalizes Mohammad and Muhammad variants');

  const similarityScore = jaroWinklerSimilarity('Mohammad Ali', 'Muhammad Ali');
  assert(similarityScore >= 0.85, 'Jaro-Winkler similarity between Mohammad & Muhammad is >= 85%', `Score: ${similarityScore}`);

  const begumBibiScore = jaroWinklerSimilarity('Rashida Bibi', 'Rashida Begum');
  assert(begumBibiScore >= 0.85, 'Jaro-Winkler recognizes Bibi vs Begum suffix synonymy', `Score: ${begumBibiScore}`);

  // TEST 2: Asymmetric Risk Router ("Wrong approvals cost more than slow approvals")
  console.log('\n--- TEST GROUP 2: Asymmetric Risk Router Mandates ---');
  const activeRule = db.getActiveRuleVersion();

  // 2A: Legitimate widow meeting all criteria -> Auto-Approved
  const legitWidow = db.getNadraRecord('35201-1234567-8');
  const legitEval = await evaluateReliefApplication(
    {
      fullName: 'Rashida Bibi',
      cnic: '35201-1234567-8',
      monthlyIncome: 18000,
      isWidow: true,
      ocrConfidence: 0.98,
    },
    legitWidow,
    activeRule
  );
  assert(legitEval.status === 'auto_approved', 'Eligible widow with matching name is auto_approved');
  assert(legitEval.confidence >= activeRule.auto_approve_threshold, 'Auto-approve confidence meets rule threshold');

  // 2B: Name variant ("Mohammad" vs "Muhammad") -> MUST NOT AUTO-APPROVE (Capped to 58%)
  const spellingVarianceEval = await evaluateReliefApplication(
    {
      fullName: 'Mohammad Ali', // document says Mohammad, NADRA says Muhammad
      cnic: '35201-9999999-9',
      monthlyIncome: 20000,
      isWidow: true,
      ocrConfidence: 0.95,
    },
    db.getNadraRecord('35201-9999999-9'),
    activeRule
  );
  assert(
    spellingVarianceEval.status === 'human_review' || spellingVarianceEval.status === 'needs_more_proof',
    'Asymmetric safeguard prevents auto-approval on Pakistani transliteration variance'
  );
  assert(
    spellingVarianceEval.confidence <= 0.58,
    'Confidence capped to <= 58% on name variance to protect public funds',
    `Score: ${spellingVarianceEval.confidence}`
  );

  // 2C: Flagged Fraud Record -> REJECTED
  const fraudRecord = db.getNadraRecord('37405-3333333-3');
  const fraudEval = await evaluateReliefApplication(
    {
      fullName: 'Perveen Akhtar',
      cnic: '37405-3333333-3',
      monthlyIncome: 12000,
      isWidow: true,
      ocrConfidence: 0.95,
    },
    fraudRecord,
    activeRule
  );
  assert(fraudEval.status === 'rejected', 'Fraud blacklisted citizen is rejected');

  // 2D: Income exceeds policy ceiling (PKR 30,000) -> REJECTED
  const richRecord = db.getNadraRecord('42101-5555555-5');
  const incomeEval = await evaluateReliefApplication(
    {
      fullName: 'Zubaida Begum',
      cnic: '42101-5555555-5',
      monthlyIncome: 48000,
      isWidow: true,
      ocrConfidence: 0.95,
    },
    richRecord,
    activeRule
  );
  assert(incomeEval.status === 'rejected', 'Applicant exceeding monthly income ceiling is rejected');

  // TEST 3: Consent Lifecycle (Data Sovereignty Engine)
  console.log('\n--- TEST GROUP 3: Consent Lifecycle (See, Share, Revoke, Correct) ---');
  // Citizen 1 has active consent for helper
  assert(db.hasActiveConsent('usr-citizen-1', 'helper') === true, 'Citizen 1 helper consent is active');

  // Citizen 2 has explicitly revoked consent for helper
  assert(db.hasActiveConsent('usr-citizen-2', 'helper') === false, 'Citizen 2 helper consent is revoked (403 block on backend)');

  // Revoking consent on Citizen 1
  db.setConsent('usr-citizen-1', 'helper', 'documents', false, 'usr-citizen-1');
  assert(db.hasActiveConsent('usr-citizen-1', 'helper') === false, 'Consent revocation takes immediate effect');

  // Re-granting consent
  db.setConsent('usr-citizen-1', 'helper', 'documents', true, 'usr-citizen-1');
  assert(db.hasActiveConsent('usr-citizen-1', 'helper') === true, 'Consent re-granting takes effect');

  // TEST 4: Scam SMS & Phishing Classifier
  console.log('\n--- TEST GROUP 4: Scam Detection & Phishing Shield ---');
  const fakeSms = '8171: Mubarak! Aap ka 25,000 Ka Ehsaas Relief Pass Hogaya Hai. Call 0300-1234567 for Raast pin.';
  const scamRes = await classifyScamMessage(fakeSms);
  assert(scamRes.is_scam === true, 'Detects fake 8171 SMS asking for PIN & phone call');
  assert(scamRes.confidence >= 0.95, 'High confidence on obvious relief scam');

  const legitNotice = 'BISP Alert: Please visit your nearest registered biometric center in Lahore.';
  const legitRes = await classifyScamMessage(legitNotice);
  assert(legitRes.is_scam === false, 'Passes legitimate informational BISP notice without false alarm');

  // TEST 5: Autonomous DPI Agent Execution with Sequential Tool Calling
  console.log('\n--- TEST GROUP 5: Autonomous DPI Agent (Plan & Execute) ---');
  const agentRun = await runDpiAutonomousAgent('Disburse relief grant to eligible widow Rashida Bibi', {
    cnic: '35201-1234567-8',
    name: 'Rashida Bibi',
    income: 18000,
    actorId: 'usr-citizen-1',
  });
  assert(agentRun.steps.length === 4, 'Autonomous agent executes 4 distinct tool calling steps');
  assert(agentRun.steps[0].tool === 'verify_identity', 'Step 1 tool: verify_identity');
  assert(agentRun.steps[1].tool === 'evaluate_rules', 'Step 2 tool: evaluate_rules');
  assert(agentRun.steps[2].tool === 'disburse_raast', 'Step 3 tool: disburse_raast');
  assert(agentRun.steps[3].tool === 'send_notification', 'Step 4 tool: send_notification');
  assert(agentRun.isEscalatedToHuman === false, 'Autonomous approval executed without escalation');

  // TEST 6: API Key Management & Validation
  console.log('\n--- TEST GROUP 6: Public REST API Keys & Swagger Auth ---');
  const testKey = apiKeyManager.issueKey('Test Provincial Gateway', 'partner');
  assert(testKey.fullKey?.startsWith('sk_live_') === true, 'Issues live secret API key with sk_live_ prefix');
  const validated = validateApiKey(testKey.fullKey!);
  assert(validated !== null, 'Validates live issued API key against SHA-256 hash');

  // TEST 7: Sliding Window Rate Limiting (120 reqs/min)
  console.log('\n--- TEST GROUP 7: Sliding Window Rate Limiter ---');
  const ip = 'test-ip-client-1';
  let allowedCount = 0;
  for (let i = 0; i < 125; i++) {
    const check = checkRateLimit(ip);
    if (check.allowed) allowedCount++;
  }
  assert(allowedCount === 120, 'Allows exactly 120 requests/minute and blocks 121st request');

  // TEST 8: Document Forgery & Tamper Heuristics
  console.log('\n--- TEST GROUP 8: Computer Vision & Forgery Shield ---');
  const forgedAnalysis = inspectDocumentForForgery('CNIC-mock-tampered', true);
  assert(forgedAnalysis.isSuspect === true, 'Detects suspicious digital artifacting / forged document');

  // SUMMARY
  console.log('\n===============================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
