import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { apiKeyManager } from '@/lib/api-keys';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin', 'officer']);
  if (authResult instanceof NextResponse) return authResult;

  const keys = apiKeyManager.getAllKeys();
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { name, role } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'API Key name is required' }, { status: 400 });
    }

    const createdKey = apiKeyManager.issueKey(name.trim(), role || 'partner');
    return NextResponse.json({
      success: true,
      message: 'New API Key generated successfully! Save this key now; it will not be displayed in full again.',
      apiKey: createdKey,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'keyId parameter is required' }, { status: 400 });
    }

    const revoked = apiKeyManager.revokeKey(keyId);
    if (!revoked) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'API Key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `API Key ${keyId} revoked.` });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
