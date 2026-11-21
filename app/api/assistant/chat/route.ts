import { NextRequest, NextResponse } from 'next/server';
import { queryDpiAssistant } from '@/lib/ai-engine';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await queryDpiAssistant(prompt, { language: language || 'en' });

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      {
        text: 'I am not sure about this information right now. Please consult an official Welfare Officer.',
        confidence: 0.4,
        isUncertain: true,
      },
      { status: 200 }
    );
  }
}
