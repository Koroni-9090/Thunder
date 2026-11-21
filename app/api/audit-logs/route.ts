import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['auditor', 'admin', 'officer']);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    totalLogs: db.auditLogs.length,
    logs: db.auditLogs,
  });
}
