import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireConsentCheck } from '@/lib/auth';
import { evaluateReliefApplication } from '@/lib/ai-engine';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  // Citizens only see their own cases
  if (user.role === 'citizen') {
    const userCases = db.cases.filter((c) => c.citizen_id === user.id || c.cnic_mock === user.cnic_mock);
    return NextResponse.json({ cases: userCases });
  }

  // Helpers: filter cases where citizen granted active consent
  if (user.role === 'helper') {
    const accessibleCases = db.cases.filter((c) => {
      return db.hasActiveConsent(c.citizen_id, 'helper');
    });
    return NextResponse.json({ cases: accessibleCases });
  }

  // Officers, Admins, Auditors see all cases (Officers sort lowest confidence first in UI)
  return NextResponse.json({ cases: db.cases });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await req.json();

  const citizenId = body.citizenId || user.id;
  const cnic = body.cnic || user.cnic_mock;
  const fullName = body.fullName || user.name;
  const monthlyIncome = Number(body.monthlyIncome || 20000);
  const isWidow = body.isWidow !== undefined ? body.isWidow : true;

  // Consent Check if submitted by helper
  if (user.role === 'helper') {
    const consentErr = requireConsentCheck(citizenId, user, 'documents');
    if (consentErr) return consentErr;
  }

  const activeRule = db.getActiveRuleVersion();
  const nadraRecord = db.getNadraRecord(cnic);

  // Run Asymmetric Risk Router
  const evalResult = await evaluateReliefApplication(
    {
      fullName,
      cnic,
      monthlyIncome,
      isWidow,
      ocrConfidence: body.ocrConfidence || 0.94,
      forgerySuspect: body.forgerySuspect || false,
    },
    nadraRecord,
    activeRule
  );

  const newCase = db.addCase({
    citizen_id: citizenId,
    citizen_name: fullName,
    cnic_mock: cnic,
    helper_id: user.role === 'helper' ? user.id : null,
    assigned_officer_id: evalResult.status === 'human_review' ? 'usr-officer-1' : null,
    rule_version_id: activeRule.id,
    status: evalResult.status,
    confidence_score: evalResult.confidence,
    extracted_data: {
      fullName,
      cnic,
      monthlyIncome,
      isWidow,
      district: body.district || nadraRecord?.district || 'General',
      ocrConfidence: body.ocrConfidence || 0.94,
      nameSimilarity: evalResult.auditor_trace.fuzzyMatchScore,
    },
    citizen_explanation_en: evalResult.citizen_explanation_en,
    citizen_explanation_ur: evalResult.citizen_explanation_ur,
    auditor_trace: evalResult.auditor_trace,
  });

  // Log to immutable audit trail
  db.addAuditLog({
    actor_id: user.id,
    actor_name: user.name,
    actor_role: user.role,
    action_type: 'CASE_CREATED',
    target_id: newCase.id,
    metadata: {
      status: newCase.status,
      confidence: newCase.confidence_score,
      rule_version: activeRule.id,
    },
  });

  // If auto-approved, trigger Raast disbursement & SMS alert
  if (newCase.status === 'auto_approved') {
    db.notifications.unshift({
      id: `notif-raast-${Date.now()}`,
      userId: citizenId,
      channel: 'sms',
      title: 'Raast Relief Disbursed',
      body: `Emergency relief of PKR 10,500 has been credited to your Raast IBAN for Case #${newCase.id}.`,
      bodyUr: `آپ کی کیس #${newCase.id} کی 10,500 روپے امداد آپ کے راست اکاؤنٹ میں منتقل کر دی گئی ہے۔`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.addAuditLog({
      actor_id: 'system',
      actor_role: 'system',
      action_type: 'RAAST_DISBURSED',
      target_id: newCase.id,
      metadata: { amount: 10500, cnic, raastSwitchRef: `RAAST-TX-${Date.now()}` },
    });
  }

  return NextResponse.json({
    message: 'Application processed by Asymmetric Risk Router',
    case: newCase,
    evaluation: evalResult,
  });
}
