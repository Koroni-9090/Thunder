'use client';

import React from 'react';
import Link from 'next/link';
import ThunderLogo from '../components/ThunderLogo';
import { useAuth } from '../components/AuthContext';
import {
  Shield,
  Zap,
  UserCheck2,
  FileCheck,
  Cpu,
  FileText,
  ExternalLink,
  Volume2,
  WifiOff,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const { switchRole, speakText } = useAuth();

  const handleLaunchRole = async (role: any, path: string) => {
    await switchRole(role);
    window.location.href = path;
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="lg:max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                <ThunderLogo size={18} />
                <span>TEAM THUNDER • CODER&apos;S CUP &apos;26 AI HACKATHON</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                SahulatRail: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                  AI on Public Rails
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                Empowering an illiterate widow to claim Emergency Relief Grants and verify suspicious SMS alerts — even with weak internet, messy handwritten names (e.g. &ldquo;Mohammad&rdquo; vs &ldquo;Muhammad&rdquo;), and evolving government thresholds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-xl hover:scale-105"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Open Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() =>
                    speakText(
                      'Welcome to SahulatRail by Team Thunder. This platform helps citizens apply for emergency relief, check scam messages, and control data privacy with full AI transparency.'
                    )
                  }
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  title="Listen in young male voice"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Listen Audio Overview</span>
                </button>

                <Link
                  href="/docs"
                  className="text-slate-400 hover:text-white px-4 py-3.5 rounded-xl text-sm font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>REST API &amp; Swagger</span>
                </Link>
              </div>

              {/* Guarantees Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Asymmetric Risk Router</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voice-First &amp; Low-Literacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Server-Side RBAC</span>
                </div>
              </div>
            </div>

            {/* Right Card: Asymmetric Risk Principle */}
            <div className="w-full lg:max-w-md bg-slate-850/90 border border-indigo-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">Core Architectural Mandate</span>
                </div>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                  RISK-CONSCIOUS
                </span>
              </div>

              <blockquote className="my-4 text-sm italic text-amber-200 bg-amber-950/30 border-l-4 border-amber-400 p-3 rounded-r-lg">
                &ldquo;Wrong approvals cost more than slow approvals.&rdquo;
              </blockquote>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                If transliterated names conflict (e.g. <em>&ldquo;Mohammad&rdquo;</em> vs <em>&ldquo;Muhammad&rdquo;</em>), the AI confidence score is automatically capped to <strong>58%</strong>, safely preventing auto-approval and routing to a human welfare officer with an immutable trace.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-800/70 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Auto-Approve Threshold:</span>
                  <span className="font-mono font-bold text-emerald-400">&ge; 85% &amp; No Fraud</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/70 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Human Handoff Threshold:</span>
                  <span className="font-mono font-bold text-amber-400">&lt; 85% or Name Variance</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/70 p-2 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Offline Queue Deduplication:</span>
                  <span className="font-mono font-bold text-indigo-300">IndexedDB + Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Multi-Role Workspaces Launchpad */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Select a Role Workspace to Test
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Switch between all 5 stakeholder roles with full server-side authorization and mock identity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Citizen */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                <UserCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Citizen View</h3>
              <p className="text-xs font-semibold text-amber-600 mb-2">Rashida Bibi (Widow)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Voice-first interface with extra-large touch targets, Urdu/English speech synthesis, camera CNIC scan, fake 8171 SMS scam checker, and complete consent withdrawal controls.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('citizen', '/citizen')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch Citizen View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Community Helper */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Community Helper</h3>
              <p className="text-xs font-semibold text-indigo-600 mb-2">Khadija Parveen (Mobilizer)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Designed for 1 shared smartphone serving 40 families. Quick family switcher with strict consent checks (blocked if consent revoked) and offline-first queue syncing.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('helper', '/helper')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch Helper View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Officer Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Officer Review Queue</h3>
              <p className="text-xs font-semibold text-emerald-600 mb-2">Tariq Mehmood (Welfare Officer)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Priority review sorted by <strong>Lowest Confidence First</strong>. Side-by-side view with uploaded document, AI extracted JSON, fuzzy name match warnings, and Assign/Escalate/Close actions.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('officer', '/officer')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch Officer Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Policy Admin & Digital Twin */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Admin &amp; Digital Twin</h3>
              <p className="text-xs font-semibold text-purple-600 mb-2">Zainab Abbas (Policy Director)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Live Rule Editor + Digital Twin Simulator. Modify income ceilings or thresholds and preview how past cases would flip before committing a new version.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('admin', '/admin')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch Admin &amp; Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. Auditor & Trace */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">5. Auditor &amp; Trace</h3>
              <p className="text-xs font-semibold text-blue-600 mb-2">Farooq Ahmed (State Auditor)</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Read-only compliance dashboard with immutable audit logs, consent revocation timeline, AI Accuracy, False Positive Rate, and anomaly detection graphs.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('auditor', '/auditor')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch Auditor View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6. REST API & Swagger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">6. Public REST API &amp; Docs</h3>
              <p className="text-xs font-semibold text-amber-600 mb-2">OpenAPI 3.0 &amp; API Keys</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Complete Swagger-compliant REST API documentation with API Key generation, rate limit monitoring, and interactive test console.
              </p>
            </div>
            <Link
              href="/docs"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open API Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Team Thunder Section */}
      <section className="bg-slate-900 text-white py-12 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ThunderLogo size={48} />
            <div>
              <h4 className="text-lg font-black tracking-tight text-white">Team Thunder</h4>
              <p className="text-xs text-slate-400">
                AI Hackathon Coder&apos;s Cup &apos;26 | FAST-NUCES Karachi Hagrid Hackathon
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <div>Simulated Mock DPI: NADRA Registry &amp; SBP Raast Switch</div>
            <div className="text-amber-400 font-mono mt-1">Status: All Systems Operational (120 req/min)</div>
          </div>
        </div>
      </section>
    </div>
  );
}
