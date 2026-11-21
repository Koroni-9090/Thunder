import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant') || 'bisp_relief_wing';

  const cases = db.getCases();
  const scams = db.getScamReports();
  const logs = db.getAuditLogs();
  const payments = db.getRaastPayments();

  const totalCases = cases.length;
  const autoApproved = cases.filter((c: any) => c.status === 'auto_approved').length;
  const humanReview = cases.filter((c: any) => c.status === 'human_review').length;
  const needsMoreProof = cases.filter((c: any) => c.status === 'needs_more_proof').length;
  const rejected = cases.filter((c: any) => c.status === 'rejected').length;

  const totalDisbursedPkr = payments.reduce((acc: number, p: any) => acc + (p.metadata?.amount || 10500), 0);

  const tenantWorkspaces = [
    { id: 'bisp_relief_wing', name: 'Federal BISP Relief Taskforce', activeCases: totalCases, district: 'National' },
    { id: 'sindh_disaster_desk', name: 'Sindh Flood Emergency Authority', activeCases: 14, district: 'Sindh' },
    { id: 'punjab_social_protect', name: 'Punjab Social Protection Bureau', activeCases: 28, district: 'Punjab' },
    { id: 'kpk_relief_command', name: 'KPK Drought Facilitation Desk', activeCases: 9, district: 'KPK' },
  ];

  return NextResponse.json({
    activeTenant: tenantWorkspaces.find((t) => t.id === tenantId) || tenantWorkspaces[0],
    tenantsList: tenantWorkspaces,
    metrics: {
      totalApplications: totalCases,
      autoApprovedCount: autoApproved,
      humanReviewCount: humanReview,
      needsProofCount: needsMoreProof,
      rejectedCount: rejected,
      autoApprovalRate: totalCases > 0 ? parseFloat(((autoApproved / totalCases) * 100).toFixed(1)) : 0,
      humanHandoffRate: totalCases > 0 ? parseFloat(((humanReview / totalCases) * 100).toFixed(1)) : 0,
      totalDisbursedPkr,
      scamMessagesFlagged: scams.filter((s: any) => s.is_scam).length,
      auditLogEventsCount: logs.length,
      averageProcessingTimeMs: 410,
    },
    districtBreakdown: [
      { district: 'Karachi West', count: 18, approvalRate: 88 },
      { district: 'Larkana', count: 9, approvalRate: 77 },
      { district: 'Lahore', count: 12, approvalRate: 66 },
      { district: 'Jacobabad', count: 6, approvalRate: 15 },
    ],
  });
}
