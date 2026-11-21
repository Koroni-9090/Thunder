import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.email || body.phone || body.identifier || '').trim();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email address or Phone number is required' },
        { status: 400 }
      );
    }

    const isPhone = /^[0-9+ -]{7,15}$/.test(identifier);
    const normalizedEmail = isPhone
      ? `${identifier.replace(/[^0-9]/g, '')}@phone.sahulatrail.pk`
      : identifier.toLowerCase();

    let user = db.getUserByEmail(normalizedEmail);

    // If user doesn't exist, create account
    if (!user) {
      const displayName = isPhone ? `Citizen ${identifier}` : identifier.split('@')[0];
      user = {
        id: `usr-${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        cnic_mock: '35201-0000000-1',
        role: 'citizen',
        language_pref: 'ur',
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    db.otpStore[normalizedEmail] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    // If skipOtp or preset fast login is requested, log straight in
    if (body.skipOtp) {
      const token = await createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cnic_mock: user.cnic_mock,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user,
        token,
      });

      response.cookies.set('sahulat_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 86400,
      });

      return response;
    }

    // Dispatch notification
    db.notifications.unshift({
      id: `notif-otp-${Date.now()}`,
      userId: user.id,
      channel: isPhone ? 'sms' : 'email',
      title: 'Sign In Verification Code',
      body: `Your SahulatRail security OTP is ${otp}. Valid for 15 minutes.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      message: `Verification code sent to ${identifier}`,
      identifier: normalizedEmail,
      otp, // surfaced for evaluation & convenience
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Login error', message: err.message }, { status: 500 });
  }
}
