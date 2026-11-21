'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, UserCheck2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [email, setEmail] = useState('');
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

  const handle1ClickLogin = async (persona: typeof personas[0]) => {
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setSuccess('Authentication successful! Redirecting...');
      setTimeout(() => {
        if (data.user?.role === 'citizen') router.push('/citizen');
        else if (data.user?.role === 'helper') router.push('/helper');
        else if (data.user?.role === 'officer') router.push('/officer');
        else if (data.user?.role === 'admin') router.push('/admin');
        else if (data.user?.role === 'auditor') router.push('/auditor');
        else router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Left: Quick Persona Switcher for Hackathon Testing */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ThunderLogo size={36} />
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">Team Thunder</h2>
                <p className="text-xs text-amber-400 font-semibold">1-Click Hackathon Evaluation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Instantly authenticate into any of the 5 roles with realistic preseeded identity, consent states, and access tokens:
            </p>

            <div className="space-y-2.5">
              {personas.map((p) => (
                <button
                  key={p.role}
                  onClick={() => handle1ClickLogin(p)}
                  disabled={loading}
                  className="w-full text-left bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl p-3 text-xs transition-all hover:border-amber-400 flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>JWT signed with HS256, 120 req/min rate limit enforced.</span>
          </div>
        </div>

        {/* Right: Email Login with Dummy Account Support */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to SahulatRail</h2>
              <p className="text-xs text-slate-600 mt-1">
                Enter any registered email or test account (e.g. <code>rashida.widow@example.com</code>).
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password / Security Code</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    defaultValue="demo1234"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Pre-filled with test credentials for demo.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Secure Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Don&apos;t have an account?</span>
            <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-800">
              Create New Account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
