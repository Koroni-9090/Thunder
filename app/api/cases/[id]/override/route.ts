import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req, ['officer', 'admin']);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const caseId = params.id;
  const { action, officerNotes } = await req.json();

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { error: 'Action must be either "approve" or "reject"' },
      { status: 400 }
    );
  }

  if (!officerNotes || !officerNotes.trim()) {
    return NextResponse.json(
      { error: 'Mandatory officerNotes required for audit trail override' },
      { status: 400 }
    );
  }

  const caseRecord = db.cases.find((c: any) => c.id === caseId);
  if (!caseRecord) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  const previousStatus = caseRecord.status;
  caseRecord.status = action === 'approve' ? 'approved' : 'rejected';
  caseRecord.auditor_trace.officerAction = action;
  caseRecord.auditor_trace.officerNotes = officerNotes;
  caseRecord.auditor_trace.assignedOfficer = user.name;
  caseRecord.auditor_trace.overrideTimestamp = new Date().toISOString();

  // Log to immutable audit trail
  db.addAuditLog({
    actor_id: user.id,
    actor_name: user.name,
    actor_role: user.role,
    action_type: 'OFFICER_OVERRIDE',
    target_id: caseId,
    metadata: {
      previousStatus,
      newStatus: caseRecord.status,
      officerNotes,
    },
  });

  // If approved by officer, trigger Raast disbursement
  if (caseRecord.status === 'approved') {
    db.notifications.unshift({
      id: `notif-override-${Date.now()}`,
      userId: caseRecord.citizen_id,
      channel: 'sms',
      title: 'Relief Approved by Welfare Officer',
      body: `Your case #${caseId} has been approved by Officer ${user.name}. PKR 10,500 disbursed via Raast.`,
      bodyUr: `آپ کا کیس #${caseId} فلاحی افسر نے منظور کر لیا ہے۔ 10,500 روپے راست پر بھیج دیے گئے ہیں۔`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    message: `Case ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    case: caseRecord,
  });
}
