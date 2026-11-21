import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cnic = searchParams.get('cnic');

  if (!cnic) {
    return NextResponse.json({
      records: db.nadraRecords,
      message: 'Provide ?cnic=35201-1234567-8 to query single citizen record',
    });
  }

  const record = db.getNadraRecord(cnic);
  if (!record) {
    return NextResponse.json(
      {
        error: 'Record Not Found',
        message: `No mock NADRA record found for CNIC: ${cnic}`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    cnic: record.cnic_mock,
    fullName: record.full_name,
    fatherOrHusbandName: record.father_or_husband_name,
    isWidow: record.is_widow,
    monthlyIncome: record.monthly_income,
    district: record.district,
    isFlaggedFraud: record.is_flagged_fraud,
    verifiedRegistry: 'MOCK_NADRA_VERISYS_DPI_2026',
  });
}
