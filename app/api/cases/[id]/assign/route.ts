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
    const { assigneeId, assigneeRole, notes } = body;

    const caseItem = db.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Case not found' }, { status: 404 });
    }

    if (assigneeRole === 'helper') {
      caseItem.helper_id = assigneeId;
    } else {
      caseItem.officer_id = assigneeId;
    }
    caseItem.updated_at = new Date().toISOString();

    db.createAuditLog({
      id: `log-${Date.now()}`,
      actor_id: user.id,
      actor_role: user.role,
      action_type: 'OFFICER_OVERRIDE',
      target_id: id,
      metadata: { action: 'CASE_ASSIGNED', assigneeId, assigneeRole, notes },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Case ${id} successfully assigned to ${assigneeId}.`,
      case: caseItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
