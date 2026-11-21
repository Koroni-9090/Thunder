import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

interface BackgroundJob {
  id: string;
  type: 'OCR_BATCH_PROCESSING' | 'RAAST_BULK_SETTLEMENT' | 'FRAUD_ANOMALY_SWEEP' | 'OFFLINE_QUEUE_SYNC';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  itemsProcessed: number;
  totalItems: number;
  initiatedBy: string;
  startedAt: string;
  completedAt?: string;
}

const GLOBAL_BACKGROUND_JOBS: BackgroundJob[] = [
  {
    id: 'job-101',
    type: 'RAAST_BULK_SETTLEMENT',
    status: 'COMPLETED',
    progressPercentage: 100,
    itemsProcessed: 42,
    totalItems: 42,
    initiatedBy: 'usr-admin-1',
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2 + 18000).toISOString(),
  },
  {
    id: 'job-102',
    type: 'FRAUD_ANOMALY_SWEEP',
    status: 'COMPLETED',
    progressPercentage: 100,
    itemsProcessed: 120,
    totalItems: 120,
    initiatedBy: 'system-cron',
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 5 + 24000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin', 'officer', 'auditor']);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({
    jobs: GLOBAL_BACKGROUND_JOBS,
    activeWorkersCount: 4,
  });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin', 'officer']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { jobType, totalItems } = body;

    const count = totalItems || 25;
    const newJob: BackgroundJob = {
      id: `job-${Date.now()}`,
      type: jobType || 'OCR_BATCH_PROCESSING',
      status: 'COMPLETED',
      progressPercentage: 100,
      itemsProcessed: count,
      totalItems: count,
      initiatedBy: user.name,
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 1500).toISOString(),
    };

    GLOBAL_BACKGROUND_JOBS.unshift(newJob);

    db.createAuditLog({
      id: `log-job-${Date.now()}`,
      actor_id: user.id,
      actor_role: user.role,
      action_type: 'RULE_UPDATED',
      target_id: newJob.id,
      metadata: { jobType: newJob.type, totalItems: count, status: 'COMPLETED' },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Background job ${newJob.id} dispatched and completed successfully.`,
      job: newJob,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
