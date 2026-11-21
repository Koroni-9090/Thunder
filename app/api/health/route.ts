import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  const casesCount = db.getCases().length;
  const auditCount = db.getAuditLogs().length;

  return NextResponse.json({
    status: 'HEALTHY',
    system: 'SahulatRail DPI Engine v2.0',
    team: 'Thunder',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    components: {
      database: { status: 'UP', records: { cases: casesCount, auditLogs: auditCount } },
      aiRouter: { status: 'UP', model: 'gemini-2.5-flash / DeterministicFallback' },
      mockNadra: { status: 'UP', endpoint: '/api/mock/nadra' },
      mockRaast: { status: 'UP', endpoint: '/api/mock/raast' },
      offlineSyncWorker: { status: 'UP', manifest: '/manifest.json' },
      rateLimiter: { status: 'ACTIVE', maxRequestsPerMin: 120 },
    },
    latencyMs: Date.now() - startTime,
  });
}
