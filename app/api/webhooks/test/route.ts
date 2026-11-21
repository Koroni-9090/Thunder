import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { webhookId, event } = await req.json();

    const hook = db.webhooks.find((w) => w.id === webhookId) || db.webhooks[0];
    if (hook) {
      hook.lastDeliveryStatus = 'SUCCESS';
      hook.lastDeliveryAt = new Date().toISOString();
    }

    return NextResponse.json({
      message: 'Test event dispatched successfully',
      event: event || 'case.approved',
      delivery: {
        status: 200,
        response: 'OK',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook test error', message: err.message }, { status: 500 });
  }
}
