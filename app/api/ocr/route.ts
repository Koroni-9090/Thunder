import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { processDocumentImage } from '@/lib/ocr-engine';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { documentBase64, fileName, rawText } = body;

    if (!documentBase64 && !rawText) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'documentBase64 or rawText is required for OCR processing' },
        { status: 400 }
      );
    }

    const ocrResult = await processDocumentImage(documentBase64 || rawText, fileName);

    // If document is flagged as tampered/forged, write audit log
    if (ocrResult.isTampered) {
      db.createAuditLog({
        id: `log-forgery-${Date.now()}`,
        actor_id: user.id,
        actor_role: user.role,
        action_type: 'SCAM_CHECK',
        target_id: ocrResult.cnic,
        metadata: {
          flag: 'DOCUMENT_FORGERY_DETECTED',
          tamperScore: ocrResult.tamperRiskScore,
          notes: ocrResult.anomalyNotes,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      service: 'SAHULAT_COMPUTER_VISION_OCR_V2',
      ocrResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
