import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { evaluateReliefApplication } from '@/lib/ai-engine';
import { RuleVersion } from '@/lib/types';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const maxIncome = Number(body.max_monthly_income || 30000);
  const autoThreshold = Number(body.auto_approve_threshold || 0.85);
  const humanThreshold = Number(body.human_handoff_threshold || 0.5);

  const testRule: RuleVersion = {
    id: 'simulated-temp-rule',
    version_number: 999,
    min_poverty_score: 0,
    max_monthly_income: maxIncome,
    required_docs: ['CNIC'],
    auto_approve_threshold: autoThreshold,
    human_handoff_threshold: humanThreshold,
    is_active: false,
    created_by: 'digital-twin-simulator',
    created_at: new Date().toISOString(),
  };

  const statusCounts: Record<string, number> = {
    auto_approved: 0,
    human_review: 0,
    needs_more_proof: 0,
    rejected: 0,
  };

  const flips: Array<{
    caseId: string;
    citizenName: string;
    oldStatus: string;
    newStatus: string;
    reason: string;
  }> = [];

  for (const c of db.cases) {
    const nadraRecord = db.getNadraRecord(c.cnic_mock);
    const evalResult = await evaluateReliefApplication(
      {
        fullName: c.extracted_data.fullName || c.citizen_name || 'Citizen',
        cnic: c.cnic_mock,
        monthlyIncome: c.extracted_data.monthlyIncome || 20000,
        isWidow: c.extracted_data.isWidow !== undefined ? c.extracted_data.isWidow : true,
        ocrConfidence: c.extracted_data.ocrConfidence || 0.95,
      },
      nadraRecord,
      testRule
    );

    statusCounts[evalResult.status] = (statusCounts[evalResult.status] || 0) + 1;

    if (evalResult.status !== c.status) {
      flips.push({
        caseId: c.id,
        citizenName: c.citizen_name || c.id,
        oldStatus: c.status,
        newStatus: evalResult.status,
        reason: evalResult.citizen_explanation_en,
      });
    }
  }

  return NextResponse.json({
    message: 'Digital Twin simulation completed',
    totalCasesEvaluated: db.cases.length,
    predictedStatusCounts: statusCounts,
    flips,
  });
}
