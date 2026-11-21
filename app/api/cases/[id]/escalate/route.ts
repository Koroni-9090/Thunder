import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req, ['officer', 'helper', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = params;
    const body = await req.json();
    const { escalationReason, supervisorRole } = body;

    const caseItem = db.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Case not found' }, { status: 404 });
    }

    const prevStatus = caseItem.status;
    caseItem.status = 'human_review';
    caseItem.extracted_data.uncertainty_reason = escalationReason || 'Escalated by desk officer for senior verification.';
    caseItem.updated_at = new Date().toISOString();

    db.createAuditLog({
      id: `log-${Date.now()}`,
      actor_id: user.id,
      actor_role: user.role,
      action_type: 'OFFICER_OVERRIDE',
      target_id: id,
      metadata: { action: 'CASE_ESCALATED', prevStatus, escalationReason, target_desk: supervisorRole || 'SENIOR_SUPERVISOR' },
      timestamp: new Date().toISOString(),
    });

    db.dispatchWebhookEvent('case.human_review', { case_id: id, reason: escalationReason });

    return NextResponse.json({
      success: true,
      message: `Case ${id} successfully escalated to senior supervisor queue.`,
      case: caseItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
