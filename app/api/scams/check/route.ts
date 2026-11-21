import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { classifyScamMessage } from '@/lib/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const { message, district } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const classification = await classifyScamMessage(message);

    const report = {
      id: `scam-${Date.now()}`,
      raw_message: message,
      is_scam: classification.is_scam,
      confidence: classification.confidence,
      scam_type: classification.scam_type,
      district: district || 'Unknown',
      explanation_simple: classification.explanation_simple,
      created_at: new Date().toISOString(),
    };

    db.scamReports.unshift(report);

    // Audit log entry
    db.addAuditLog({
      actor_id: 'citizen-or-anonymous',
      actor_role: 'citizen',
      action_type: 'SCAM_CHECK',
      target_id: report.id,
      metadata: {
        is_scam: classification.is_scam,
        confidence: classification.confidence,
        scam_type: classification.scam_type,
      },
    });

    return NextResponse.json({
      success: true,
      result: classification,
      analysis: {
        isScam: classification.is_scam,
        is_scam: classification.is_scam,
        confidence: classification.confidence,
        scamType: classification.scam_type,
        explanationSimpleEn: classification.explanation_simple,
        explanationSimpleUr: classification.explanation_ur,
        warningSigns: classification.warning_signs,
      },
      reportId: report.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Scam check failed', message: err.message }, { status: 500 });
  }
}
