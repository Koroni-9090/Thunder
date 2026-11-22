'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, loginUser } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const personas: { role: UserRole; name: string; email: string; desc: string; redirect: string }[] = [
    {
      role: 'citizen',
      name: 'Rashida Bibi',
      email: 'rashida.widow@example.com',
      desc: 'Citizen • Illiterate Widow applying for emergency grant',
      redirect: '/citizen',
    },
    {
      role: 'helper',
      name: 'Khadija Parveen',
      email: 'khadija.helper@example.com',
      desc: 'Community Helper • 1 phone serving 40 village families',
      redirect: '/helper',
    },
    {
      role: 'officer',
      name: 'Tariq Mehmood',
      email: 'tariq.officer@example.com',
      desc: 'Welfare Officer • Reviewing low-confidence AI handoffs',
      redirect: '/officer',
    },
    {
      role: 'admin',
      name: 'Zainab Abbas',
      email: 'zainab.admin@example.com',
      desc: 'Policy Admin • Live rule editor & Digital Twin simulator',
      redirect: '/admin',
    },
    {
      role: 'auditor',
      name: 'Farooq Ahmed',
      email: 'farooq.auditor@example.com',
      desc: 'State Auditor • Immutable audit logs & AI evaluation',
      redirect: '/auditor',
    },
  ];

  const handle1ClickLogin = async (persona: (typeof personas)[0]) => {
    setLoading(true);
    setError('');
    try {
      await switchRole(persona.role);
      router.push(persona.redirect);
    } catch {
      setError('Failed to switch persona. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Email or Phone Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (data.requiresOtp) {
        setDemoOtp(data.otp || '123456');
        setOtpStep(true);
        setSuccess(`Verification code sent! (Demo Code: ${data.otp || '123456'})`);
      } else if (data.user) {
        loginUser(data.user, data.token);
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch (err: any) {
      setError(err.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');

      loginUser(data.user, data.token);
      setSuccess('Verification verified! Welcome to SahulatRail.');

      setTimeout(() => {
        if (data.user?.role === 'citizen') router.push('/citizen');
        else if (data.user?.role === 'helper') router.push('/helper');
        else if (data.user?.role === 'officer') router.push('/officer');
        else if (data.user?.role === 'admin') router.push('/admin');
        else if (data.user?.role === 'auditor') router.push('/auditor');
        else router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#FFFFFF]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#383737] rounded-lg border border-[#616060] shadow-xl overflow-hidden p-6 sm:p-8">
        {/* Left: Quick 1-Click Evaluation Personas for Hackathon Judges */}
        <div className="bg-[#2E2D2D] rounded-lg border border-[#616060] p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <ThunderLogo size={32} withText={false} />
              <div>
                <h2 className="text-lg font-bold text-[#FFFFFF]">Team Thunder</h2>
                <p className="text-xs text-[#F59E0B] font-bold">1-Click Evaluation Personas</p>
              </div>
            </div>

            <p className="text-xs text-[#D1D5DB] mb-4 leading-relaxed">
              Authenticate directly into any of the 5 roles with preseeded verified identity, mock NADRA records, and consents:
            </p>

            <div className="space-y-2">
              {personas.map((p) => (
                <button
                  key={p.role}
                  onClick={() => handle1ClickLogin(p)}
                  disabled={loading}
                  className="w-full text-left bg-white hover:bg-slate-50 border border-[#616060] rounded-md p-2.5 text-xs transition shadow-sm hover:border-[#F59E0B] flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-[#FFFFFF] flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#F59E0B]/20 text-[#F59E0B]">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#D1D5DB] mt-0.5">{p.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#F59E0B] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#616060] text-[11px] text-[#D1D5DB] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
            <span>120 reqs/min rate limit and server-side RBAC enforced.</span>
          </div>
        </div>

        {/* Right: Direct Email / Phone Sign In with OTP Verification */}
        <div className="bg-white rounded-lg border border-[#616060] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#FFFFFF]">Sign In to SahulatRail</h2>
              <p className="text-xs text-[#D1D5DB] mt-1">
                Enter your Email address or Mobile phone number (e.g. <code>0300-1234567</code>).
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-950 text-xs rounded-md flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs rounded-md flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {!otpStep ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    Email Address or Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D1D5DB] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 0300-1234567 or rashida@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#616060] rounded-md text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <p className="text-[10px] text-[#D1D5DB] mt-1">
                    Accepts Pakistani phone numbers or any registered email.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
                >
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-[#2E2D2D] border border-[#616060] p-3 rounded-md text-xs text-[#FFFFFF]">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-[#F59E0B]">
                    <Sparkles className="w-4 h-4" />
                    <span>Sandbox OTP Code</span>
                  </div>
                  <p className="text-[11px] text-[#D1D5DB]">
                    For hackathon grading convenience, your verification code is:
                  </p>
                  <div className="text-xl font-bold font-mono tracking-widest text-[#FFFFFF] mt-1 bg-white p-2 rounded border border-[#616060] text-center">
                    {demoOtp || '123456'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#D1D5DB] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#616060] rounded-md text-sm font-mono tracking-widest text-[#FFFFFF] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="w-full text-center text-xs text-[#D1D5DB] hover:text-[#FFFFFF] py-1"
                >
                  &larr; Change email or phone number
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#616060] flex items-center justify-between text-xs text-[#D1D5DB]">
            <span>Don&apos;t have an account?</span>
            <Link href="/signup" className="font-bold text-[#F59E0B] hover:underline">
              Create Account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
