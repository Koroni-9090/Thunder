'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import {
  UserCheck2,
  Mail,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [cnic, setCnic] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim() || !cnic.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: identifier, cnic, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initiate registration');

      setDemoOtp(data.otp || '123456');
      setStep('OTP');
      setSuccess(`Verification code dispatched to ${identifier}!`);
    } catch (err: any) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');

      loginUser(data.user, data.token);
      setSuccess('Identity verified! Launching workspace...');

      setTimeout(() => {
        if (role === 'citizen') router.push('/citizen');
        else if (role === 'helper') router.push('/helper');
        else if (role === 'officer') router.push('/officer');
        else router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#1C1B1F]">
      <div className="max-w-lg w-full bg-white rounded-lg border border-[#9E98A8] shadow-xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 mb-2">
          <ThunderLogo size={32} withText={false} />
          <div>
            <h2 className="text-xl font-bold text-[#1C1B1F]">Create SahulatRail Account</h2>
            <p className="text-xs text-[#859114] font-bold">Self-Registration &amp; OTP Verification</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-950 text-xs rounded-md flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs rounded-md flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 'DETAILS' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rashida Bibi or Khadija Parveen"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                Email Address or Mobile Phone Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#46434D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 0300-1234567"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1">CNIC Number</label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35201-1234567-8"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-[#9E98A8] rounded-md text-xs font-mono text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Select Persona Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
              >
                <option value="citizen">Citizen (Applying for Emergency Relief Grant)</option>
                <option value="helper">Community Helper (1 Phone for 40 Families)</option>
                <option value="officer">Welfare Officer (Review &amp; Override Decisions)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
            >
              <span>{loading ? 'Dispatching Verification...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-[#D5D1DC] border border-[#9E98A8] p-3 rounded-md text-xs text-[#1C1B1F]">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-[#859114]">
                <Sparkles className="w-4 h-4" />
                <span>Verification OTP Sent</span>
              </div>
              <p className="text-[11px] text-[#46434D]">
                For hackathon judges and testing, your 6-digit code is:
              </p>
              <div className="text-xl font-bold font-mono tracking-widest text-[#1C1B1F] mt-1 bg-white p-2 rounded border border-[#9E98A8] text-center">
                {demoOtp || '123456'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Enter 6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#46434D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP code"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#9E98A8] rounded-md text-sm font-mono tracking-widest text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP & Finish Account Setup'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('DETAILS')}
              className="w-full text-center text-xs text-[#46434D] hover:text-[#1C1B1F] py-1"
            >
              &larr; Back to details
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-[#9E98A8] flex items-center justify-between text-xs text-[#46434D]">
          <span>Already registered?</span>
          <Link href="/login" className="font-bold text-[#859114] hover:underline">
            Sign In Instead &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
