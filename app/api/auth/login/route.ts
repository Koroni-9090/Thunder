import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = db.getUserByEmail(email);

    // If user doesn't exist, create dummy user on the fly for demo flexibility
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email.toLowerCase(),
        cnic_mock: '35201-9999999-1',
        role: 'citizen',
        language_pref: 'ur',
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cnic_mock: user.cnic_mock,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user,
      token,
    });

    // Set HTTP-only session cookie
    response.cookies.set('sahulat_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Login error', message: err.message }, { status: 500 });
  }
}
