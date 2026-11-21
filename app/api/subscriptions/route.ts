import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant-punjab-relief';

  const usage = db.subscriptions[tenantId] || {
    tenantId,
    planName: 'Starter Free',
    apiCallsLimit: 10000,
    apiCallsUsed: 520,
    casesLimit: 1000,
    casesUsed: 42,
    aiTokensUsed: 12500,
    resetDate: '2026-03-01T00:00:00Z',
  };

  return NextResponse.json({
    tenantId,
    usage,
    allTenants: Object.keys(db.subscriptions),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { tenantId, planName } = await req.json();

  if (!tenantId || !planName) {
    return NextResponse.json({ error: 'tenantId and planName required' }, { status: 400 });
  }

  const limits: Record<string, { api: number; cases: number }> = {
    'Starter Free': { api: 10000, cases: 1000 },
    'Pro Government': { api: 100000, cases: 10000 },
    'Enterprise DPI': { api: 500000, cases: 50000 },
  };

  const planLimits = limits[planName] || limits['Starter Free'];

  db.subscriptions[tenantId] = {
    tenantId,
    planName,
    apiCallsLimit: planLimits.api,
    apiCallsUsed: 0,
    casesLimit: planLimits.cases,
    casesUsed: 0,
    aiTokensUsed: 0,
    resetDate: '2026-04-01T00:00:00Z',
  };

  return NextResponse.json({
    message: `Tenant ${tenantId} upgraded to ${planName}`,
    usage: db.subscriptions[tenantId],
  });
}
