import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { caseId, cnic, amount, beneficiaryName } = await req.json();

    if (!amount || !cnic) {
      return NextResponse.json(
        { error: 'Amount and CNIC are required for Raast disbursement' },
        { status: 400 }
      );
    }

    const txId = `RAAST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.addAuditLog({
      actor_id: 'raast-gateway',
      actor_role: 'system',
      action_type: 'RAAST_DISBURSED',
      target_id: caseId || cnic,
      metadata: {
        txId,
        amount,
        cnic,
        beneficiaryName: beneficiaryName || 'Citizen',
        switch: 'SBP_RAAST_CORE_P2P',
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: txId,
      amount,
      currency: 'PKR',
      status: 'SETTLED',
      settlementTimestamp: new Date().toISOString(),
      raastRail: 'SBP Instant ISO-20022 Switch',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Raast payment error', message: err.message }, { status: 500 });
  }
}
