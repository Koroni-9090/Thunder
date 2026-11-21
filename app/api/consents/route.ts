import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// 1. SEE CONSENTS
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { searchParams } = new URL(req.url);
  const targetCitizenId = searchParams.get('citizenId') || user.id;

  if (targetCitizenId !== user.id && user.role !== 'admin' && user.role !== 'auditor') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'You cannot view consent records of another citizen.' },
      { status: 403 }
    );
  }

  const consents = db.getConsentsForCitizen(targetCitizenId);
  const citizen = db.getUserById(targetCitizenId);

  return NextResponse.json({
    consents,
    citizenData: citizen ? { id: citizen.id, name: citizen.name, cnic: citizen.cnic_mock, email: citizen.email } : null,
  });
}

// 2. SHARE OR WITHDRAW (REVOKE) CONSENT
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ['citizen', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { citizenId, grantedToRole, scope, isActive } = body;

    const targetCitizen = citizenId || user.id;

    if (user.role === 'citizen' && targetCitizen !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'You cannot modify consents for other citizens.' },
        { status: 403 }
      );
    }

    if (!grantedToRole || !scope || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'grantedToRole, scope, and isActive are required' },
        { status: 400 }
      );
    }

    const updated = db.setConsent(targetCitizen, grantedToRole, scope, isActive, user.id);
    return NextResponse.json({
      success: true,
      message: isActive ? `Consent granted to ${grantedToRole} for ${scope}.` : `Consent REVOKED for ${grantedToRole}. Backend access blocked.`,
      consent: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}

// 3. CORRECT DATA (Citizen rights: rectify inaccurate or misspelled identity records)
export async function PUT(req: NextRequest) {
  const authResult = await requireAuth(req, ['citizen', 'helper', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { citizenId, correctedName, correctedCnic, correctionReason } = body;

    const targetId = citizenId || user.id;
    const citizen = db.getUserById(targetId);

    if (!citizen) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Citizen record not found' }, { status: 404 });
    }

    const previousRecord = { name: citizen.name, cnic: citizen.cnic_mock };

    if (correctedName) citizen.name = correctedName;
    if (correctedCnic) citizen.cnic_mock = correctedCnic;

    // Record immutable audit trail of citizen data rectification
    db.createAuditLog({
      id: `log-correction-${Date.now()}`,
      actor_id: user.id,
      actor_role: user.role,
      action_type: 'CONSENT_GRANTED',
      target_id: targetId,
      metadata: {
        action: 'CITIZEN_DATA_CORRECTED',
        previousRecord,
        updatedRecord: { name: citizen.name, cnic: citizen.cnic_mock },
        correctionReason: correctionReason || 'Citizen requested phonetic transliteration rectification',
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Citizen identity record rectified successfully under DPI Data Sovereignty Ordinance.',
      updatedCitizen: citizen,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
