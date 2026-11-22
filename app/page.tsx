'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThunderLogo from '../components/ThunderLogo';
import { useAuth, PRESET_USERS } from '../components/AuthContext';
import {
  Shield,
  Zap,
  UserCheck2,
  FileCheck,
  Cpu,
  FileText,
  ExternalLink,
  Volume2,
  ArrowRight,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Mail,
  Phone,
  KeyRound,
  UserPlus,
  LogIn,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../lib/types';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loginUser, logout, switchRole, speakText } = useAuth();

  // Auth Portal State on Home Screen
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'demo'>('login');
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState('');
  const [signupCnic, setSignupCnic] = useState('35201-1234567-8');
  const [signupRole, setSignupRole] = useState<UserRole>('citizen');

  // Handle Send OTP (Login)
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!identifier.trim()) {
      setAuthError('Please enter your email address or phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');

      setOtpSent(true);
      setDemoOtp(data.otp || '123456');
      setAuthSuccess(`Verification code dispatched to ${identifier}. Valid for 15 minutes.`);
    } catch (err: any) {
      setAuthError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP (Login)
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!otpCode.trim()) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      loginUser(data.user, data.token);
      setAuthSuccess('Verification successful! Entering authorized workspace...');

      // Route to user's permitted role workspace
      setTimeout(() => {
        if (data.user.role === 'citizen') router.push('/citizen');
        else if (data.user.role === 'helper') router.push('/helper');
        else if (data.user.role === 'officer') router.push('/officer');
        else if (data.user.role === 'admin') router.push('/admin');
        else if (data.user.role === 'auditor') router.push('/auditor');
        else router.push('/dashboard');
      }, 600);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup & Send OTP
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!signupName.trim() || !signupEmailOrPhone.trim() || !signupCnic.trim()) {
      setAuthError('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmailOrPhone.trim(),
          cnic: signupCnic.trim(),
          role: signupRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setIdentifier(signupEmailOrPhone.trim());
      setOtpSent(true);
      setDemoOtp(data.otp || '123456');
      setAuthTab('login');
      setAuthSuccess(`Account created! We sent an OTP to ${signupEmailOrPhone}. Please verify.`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Judge Quick Login
  const handleQuickDemoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await switchRole(role);
      setAuthSuccess(`Authenticated as ${PRESET_USERS[role].name}. Redirecting...`);
      setTimeout(() => {
        if (role === 'citizen') router.push('/citizen');
        else if (role === 'helper') router.push('/helper');
        else if (role === 'officer') router.push('/officer');
        else if (role === 'admin') router.push('/admin');
        else if (role === 'auditor') router.push('/auditor');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const getUserWorkspacePath = (role: string) => {
    if (role === 'citizen') return '/citizen';
    if (role === 'helper') return '/helper';
    if (role === 'officer') return '/officer';
    if (role === 'admin') return '/admin';
    if (role === 'auditor') return '/auditor';
    return '/dashboard';
  };

  return (
    <div className="w-full text-white">
      {/* Hero Section */}
      <section className="bg-[#859114] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#6F7910] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="lg:max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#1C1B1F] text-white border border-[#616060] px-3.5 py-1 rounded-md text-xs font-bold tracking-wide">
                <ThunderLogo size={18} withText={false} />
                <span>TEAM THUNDER • CODER&apos;S CUP &apos;26 AI HACKATHON</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                SahulatRail: <br />
                <span className="text-[#FEF08A] drop-shadow-sm">AI on Public Rails</span>
              </h1>

              <p className="text-sm sm:text-base text-white/95 leading-relaxed">
                Empowering an illiterate widow to claim Emergency Relief Grants and verify suspicious SMS alerts — even with weak internet, messy handwritten names (e.g. &ldquo;Mohammad&rdquo; vs &ldquo;Muhammad&rdquo;), and evolving government thresholds.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    speakText(
                      'Welcome to SahulatRail by Team Thunder. Please sign in or create an account to access the citizen relief portal, community helper kiosk, or welfare officer queue.'
                    )
                  }
                  className="bg-white hover:bg-slate-100 text-[#1C1B1F] px-4 py-2.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow"
                  title="Listen in young male voice"
                >
                  <Volume2 className="w-4 h-4 text-[#859114]" />
                  <span>Listen Voice Guide</span>
                </button>

                <Link
                  href="/dashboard"
                  className="bg-[#1C1B1F] hover:bg-black text-white px-4 py-2.5 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <span>Public Command Center</span>
                </Link>

                <Link
                  href="/docs"
                  className="text-white hover:underline px-3 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>REST API &amp; Swagger</span>
                </Link>
              </div>

              {/* Security Mandates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/20 text-xs text-white">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FEF08A]" />
                  <span>Asymmetric Risk Router</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FEF08A]" />
                  <span>Voice-First &amp; Low-Literacy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FEF08A]" />
                  <span>Consent Enforcement</span>
                </div>
              </div>
            </div>

            {/* Right Card: MANDATORY FIRST-STEP AUTHENTICATION PORTAL */}
            <div className="w-full lg:max-w-md bg-[#383737] rounded-lg border-2 border-[#616060] p-6 shadow-2xl text-white">
              {isLoggedIn && currentUser ? (
                /* Authenticated State Display */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#616060]">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#859114] flex items-center justify-center font-bold text-lg">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{currentUser.name}</div>
                        <div className="text-[11px] text-[#D1D5DB] uppercase font-mono font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Role: {currentUser.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="text-xs bg-red-900/60 hover:bg-red-800 text-white px-2.5 py-1 rounded flex items-center gap-1 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>

                  <div className="bg-[#2E2D2D] p-3 rounded-md text-xs space-y-1.5 border border-[#525151]">
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]">Email / Phone:</span>
                      <span className="font-mono text-white">{currentUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]">Mock CNIC:</span>
                      <span className="font-mono text-white">{currentUser.cnic_mock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A3A3A3]">Access Level:</span>
                      <span className="font-bold text-[#F59E0B] uppercase">{currentUser.role} Workspace</span>
                    </div>
                  </div>

                  <Link
                    href={getUserWorkspacePath(currentUser.role)}
                    className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-black py-3 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition shadow-lg text-center"
                  >
                    <span>Enter {currentUser.role.toUpperCase()} Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Unauthenticated State: Mandatory Login / Signup Portal */
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#F59E0B]" />
                      <span>Identity Verification Portal</span>
                    </h3>
                    <p className="text-xs text-[#D1D5DB] mt-0.5">
                      First step: Verify email or mobile number to enter your authorized workspace.
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-[#2E2D2D] p-1 rounded-md border border-[#525151] text-xs">
                    <button
                      onClick={() => {
                        setAuthTab('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className={`py-1.5 rounded font-bold transition ${
                        authTab === 'login' ? 'bg-[#859114] text-white shadow' : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthTab('signup');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className={`py-1.5 rounded font-bold transition ${
                        authTab === 'signup' ? 'bg-[#859114] text-white shadow' : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setAuthTab('demo');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className={`py-1.5 rounded font-bold transition ${
                        authTab === 'demo' ? 'bg-[#859114] text-white shadow' : 'text-[#D1D5DB] hover:text-white'
                      }`}
                    >
                      Judge Demo
                    </button>
                  </div>

                  {/* Error & Success Alerts */}
                  {authError && (
                    <div className="p-2.5 rounded bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                  {authSuccess && (
                    <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  {/* 1. SIGN IN TAB */}
                  {authTab === 'login' && (
                    <div className="space-y-3">
                      {!otpSent ? (
                        <form onSubmit={handleSendLoginOtp} className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-[#D1D5DB] mb-1">
                              Email Address or Mobile Phone
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="e.g. 0300-1234567 or rashida@example.com"
                                className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#859114]"
                                required
                              />
                            </div>
                            <span className="text-[10px] text-[#A3A3A3] mt-1 block">
                              Supports simulated Pakistani mobile (+92300...) and email formats.
                            </span>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-4 rounded-md text-xs flex items-center justify-center gap-1.5 transition shadow"
                          >
                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                            <span>Send Verification OTP</span>
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyLoginOtp} className="space-y-3 animate-in fade-in">
                          {demoOtp && (
                            <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] flex items-center justify-between">
                              <span>Evaluation OTP: <strong>{demoOtp}</strong></span>
                              <button
                                type="button"
                                onClick={() => setOtpCode(demoOtp)}
                                className="underline font-bold text-white hover:text-amber-100"
                              >
                                Auto-Fill
                              </button>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-[#D1D5DB] mb-1">
                              Enter 6-Digit Verification Code
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="123456"
                              className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-[#859114]"
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode('');
                              }}
                              className="w-1/3 bg-[#4A4949] hover:bg-[#525151] text-white text-xs py-2 rounded-md"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-2/3 bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-1.5 transition shadow"
                            >
                              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              <span>Verify &amp; Enter</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* 2. SIGN UP TAB (MULTIPLE USERS) */}
                  {authTab === 'signup' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#D1D5DB] mb-0.5">Full Name</label>
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Fatima Jamil"
                          className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#859114]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#D1D5DB] mb-0.5">Email or Phone</label>
                        <input
                          type="text"
                          value={signupEmailOrPhone}
                          onChange={(e) => setSignupEmailOrPhone(e.target.value)}
                          placeholder="fatima@example.com or 0312-3456789"
                          className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#859114]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#D1D5DB] mb-0.5">Mock CNIC</label>
                          <input
                            type="text"
                            value={signupCnic}
                            onChange={(e) => setSignupCnic(e.target.value)}
                            placeholder="35201-XXXXXXX-X"
                            className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#859114]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#D1D5DB] mb-0.5">Assigned Role</label>
                          <select
                            value={signupRole}
                            onChange={(e) => setSignupRole(e.target.value as UserRole)}
                            className="w-full bg-[#2A2929] border border-[#616060] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#859114]"
                          >
                            <option value="citizen">Citizen (Applicant)</option>
                            <option value="helper">Community Helper</option>
                            <option value="officer">Welfare Officer</option>
                            <option value="admin">Policy Admin</option>
                            <option value="auditor">State Auditor</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2 px-3 rounded-md text-xs flex items-center justify-center gap-1.5 transition shadow mt-1"
                      >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        <span>Register Account &amp; Send OTP</span>
                      </button>
                    </form>
                  )}

                  {/* 3. JUDGE DEMO PERSONAS */}
                  {authTab === 'demo' && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-[#D1D5DB] mb-1">
                        Select a pre-configured hackathon role for instant evaluation testing:
                      </p>
                      {[
                        { role: 'citizen' as UserRole, name: 'Rashida Bibi (Widow)', title: 'Citizen Portal' },
                        { role: 'helper' as UserRole, name: 'Khadija Parveen', title: 'Community Helper (40 Families)' },
                        { role: 'officer' as UserRole, name: 'Tariq Mehmood', title: 'Welfare Officer (Review Queue)' },
                        { role: 'admin' as UserRole, name: 'Zainab Abbas', title: 'Policy Admin (Digital Twin)' },
                        { role: 'auditor' as UserRole, name: 'Farooq Ahmed', title: 'State Auditor (Audit Trail)' },
                      ].map((item) => (
                        <button
                          key={item.role}
                          onClick={() => handleQuickDemoLogin(item.role)}
                          className="w-full text-left bg-[#2A2929] hover:bg-[#4A4949] p-2 rounded-md border border-[#525151] flex items-center justify-between text-xs transition"
                        >
                          <div>
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-[10px] text-[#A3A3A3]">{item.title}</div>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-black bg-[#F59E0B] px-1.5 py-0.5 rounded">
                            {item.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Challenge Pillars Reference Section */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Architecture Designed for Real-World Pakistani Governance
          </h2>
          <p className="text-xs sm:text-sm text-[#D1D5DB] max-w-2xl mx-auto">
            Addressing all 8 challenges from the Coder&apos;s Cup &apos;26 specification with strict server-side RBAC, consent enforcement, and asymmetric risk routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#383737] p-5 rounded-lg border border-[#616060] shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-[#859114] text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-white">Asymmetric Risk</h3>
            <p className="text-xs text-[#D1D5DB]">
              False approvals cost public money; false rejections cost human lives. When names vary, cases are routed to officers.
            </p>
          </div>

          <div className="bg-[#383737] p-5 rounded-lg border border-[#616060] shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-[#859114] text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-white">Digital Twin Sandbox</h3>
            <p className="text-xs text-[#D1D5DB]">
              Policy changes run in simulation against historical cases to predict approval flips and budget delta before activation.
            </p>
          </div>

          <div className="bg-[#383737] p-5 rounded-lg border border-[#616060] shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-[#859114] text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-white">Name Suffix Aliasing</h3>
            <p className="text-xs text-[#D1D5DB]">
              Normalizes transliterations (&ldquo;Mohammad&rdquo; vs &ldquo;Muhammad&rdquo;, &ldquo;Bibi&rdquo; vs &ldquo;Begum&rdquo;) using Jaro-Winkler.
            </p>
          </div>

          <div className="bg-[#383737] p-5 rounded-lg border border-[#616060] shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-[#859114] text-white flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-sm text-white">Consent Revocation (403)</h3>
            <p className="text-xs text-[#D1D5DB]">
              Citizens can revoke helper access at any time. Backend immediately blocks access with strict 403 Forbidden.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
