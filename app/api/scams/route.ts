import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    reports: db.scamReports,
  });
}
