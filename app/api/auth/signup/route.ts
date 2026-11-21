import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, cnic, role } = await req.json();

    if (!name || !email || !cnic) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    db.otpStore[email.toLowerCase()] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    };

    // Pre-register user in pending state or check existing
    const existing = db.getUserByEmail(email);
    if (!existing) {
      db.users.push({
        id: `usr-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        cnic_mock: cnic,
        role: role || 'citizen',
        language_pref: 'ur',
        created_at: new Date().toISOString(),
      });
    }

    // Dispatch mock notification to user
    db.notifications.unshift({
      id: `notif-otp-${Date.now()}`,
      userId: email,
      channel: 'sms',
      title: 'Verification Code',
      body: `Your SahulatRail security OTP is ${otp}. Valid for 15 minutes.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.addAuditLog({
      actor_id: email,
      actor_name: name,
      actor_role: role || 'citizen',
      action_type: 'CASE_CREATED',
      target_id: email,
      metadata: { action: 'OTP_REQUESTED', cnic },
    });

    return NextResponse.json({
      message: 'OTP generated and sent',
      otp, // surfaced for evaluation & demo simplicity
      email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Signup error', message: err.message }, { status: 500 });
  }
}
