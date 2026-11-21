import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    webhooks: db.webhooks,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { name, url, events, secretKey } = await req.json();

  if (!name || !url || !events) {
    return NextResponse.json({ error: 'Missing name, url, or events' }, { status: 400 });
  }

  const newHook = {
    id: `wh-${Date.now()}`,
    name,
    url,
    events: Array.isArray(events) ? events : [events],
    secretKey: secretKey || `whsec_${Math.random().toString(36).substr(2, 8)}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastDeliveryStatus: 'PENDING' as const,
  };

  db.webhooks.unshift(newHook);

  return NextResponse.json({
    message: 'Webhook registered successfully',
    webhook: newHook,
  });
}
