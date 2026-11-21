import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req, ['officer', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = params;
    const body = await req.json();
    const { resolutionSummary, finalStatus } = body;

    const caseItem = db.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Case not found' }, { status: 404 });
    }

    const prevStatus = caseItem.status;
    caseItem.status = finalStatus === 'rejected' ? 'rejected' : 'approved';
    caseItem.officer_notes = resolutionSummary || 'Case closed after physical union council reconciliation.';
    caseItem.updated_at = new Date().toISOString();

    db.createAuditLog({
      id: `log-${Date.now()}`,
      actor_id: user.id,
      actor_role: user.role,
      action_type: 'OFFICER_OVERRIDE',
      target_id: id,
      metadata: { action: 'CASE_CLOSED', prevStatus, finalStatus: caseItem.status, resolutionSummary },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Case ${id} successfully closed as ${caseItem.status.toUpperCase()}.`,
      case: caseItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
