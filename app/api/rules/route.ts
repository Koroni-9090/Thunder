import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const activeRule = db.getActiveRuleVersion();
  return NextResponse.json({
    activeRule,
    allVersions: db.ruleVersions,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const body = await req.json();

  const maxIncome = Number(body.max_monthly_income || 30000);
  const autoThreshold = Number(body.auto_approve_threshold || 0.85);
  const humanThreshold = Number(body.human_handoff_threshold || 0.5);
  const minPoverty = Number(body.min_poverty_score || 0);
  const requiredDocs = body.required_docs || ['CNIC', 'Death Certificate of Husband'];

  // Deactivate previous active rules
  for (const r of db.ruleVersions) {
    r.is_active = false;
  }

  const nextVersionNum = db.ruleVersions.length + 1;
  const newRule = {
    id: `rule-v${nextVersionNum}`,
    version_number: nextVersionNum,
    min_poverty_score: minPoverty,
    max_monthly_income: maxIncome,
    required_docs: requiredDocs,
    auto_approve_threshold: autoThreshold,
    human_handoff_threshold: humanThreshold,
    is_active: true,
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  db.ruleVersions.unshift(newRule);

  // Log to immutable audit trail
  db.addAuditLog({
    actor_id: user.id,
    actor_name: user.name,
    actor_role: user.role,
    action_type: 'RULE_UPDATED',
    target_id: newRule.id,
    metadata: {
      version: newRule.version_number,
      max_monthly_income: newRule.max_monthly_income,
      auto_approve_threshold: newRule.auto_approve_threshold,
      human_handoff_threshold: newRule.human_handoff_threshold,
    },
  });

  return NextResponse.json({
    message: `Rule version ${newRule.version_number} saved and activated.`,
    rule: newRule,
  });
}
