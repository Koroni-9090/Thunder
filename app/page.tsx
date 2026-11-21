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
  AlertTriangle,
} from 'lucide-react';

export default function HomePage() {
  const { switchRole, speakText } = useAuth();

  const handleLaunchRole = async (role: any, path: string) => {
    await switchRole(role);
    window.location.href = path;
  };

  return (
    <div className="w-full text-[#1C1B1F]">
      {/* Hero Section */}
      <section className="bg-[#859114] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#6F7910] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Content */}
            <div className="lg:max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 bg-black/20 text-white border border-white/30 px-3.5 py-1 rounded-md text-xs font-bold tracking-wide">
                <ThunderLogo size={18} withText={false} />
                <span>TEAM THUNDER • CODER&apos;S CUP &apos;26 AI HACKATHON</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                SahulatRail: <br />
                <span className="text-white drop-shadow-sm">
                  AI on Public Rails
                </span>
              </h1>

              <p className="text-sm sm:text-base text-white/95 leading-relaxed">
                Empowering an illiterate widow to claim Emergency Relief Grants and verify suspicious SMS alerts — even with weak internet, messy handwritten names (e.g. &ldquo;Mohammad&rdquo; vs &ldquo;Muhammad&rdquo;), and evolving government thresholds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="bg-[#1C1B1F] hover:bg-black text-white font-bold px-5 py-3 rounded-md text-xs sm:text-sm flex items-center gap-2 transition shadow-lg"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Open Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() =>
                    speakText(
                      'Welcome to SahulatRail by Team Thunder. This platform helps citizens apply for emergency relief, check scam messages, and control data privacy with full AI transparency.'
                    )
                  }
                  className="bg-white hover:bg-slate-50 text-[#1C1B1F] border border-white/40 px-4 py-3 rounded-md text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow"
                  title="Listen in young male voice"
                >
                  <Volume2 className="w-4 h-4 text-[#859114]" />
                  <span>Listen Audio Overview</span>
                </button>

                <Link
                  href="/docs"
                  className="text-white hover:underline px-3 py-3 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>REST API &amp; Swagger</span>
                </Link>
              </div>

              {/* Guarantees Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/20 text-xs text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Asymmetric Risk Router</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Voice-First &amp; Low-Literacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>100% Server-Side RBAC</span>
                </div>
              </div>
            </div>

            {/* Right Card: Asymmetric Risk Principle */}
            <div className="w-full lg:max-w-md bg-[#D5D1DC] text-[#1C1B1F] border border-[#9E98A8] rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#9E98A8]">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#859114]" />
                  <span className="text-sm font-bold text-[#1C1B1F]">Core Architectural Mandate</span>
                </div>
                <span className="text-[10px] bg-[#859114] text-white px-2 py-0.5 rounded font-mono font-bold">
                  RISK-CONSCIOUS
                </span>
              </div>

              <blockquote className="my-3.5 text-xs italic text-[#1C1B1F] bg-white border-l-4 border-[#859114] p-3 rounded-r-md">
                &ldquo;Wrong approvals cost more than slow approvals.&rdquo;
              </blockquote>

              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                If transliterated names conflict (e.g. <em>&ldquo;Mohammad&rdquo;</em> vs <em>&ldquo;Muhammad&rdquo;</em>), the AI confidence score is automatically capped to <strong>58%</strong>, safely preventing auto-approval and routing to a human welfare officer with an immutable trace.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded-md border border-[#9E98A8]">
                  <span className="text-[#46434D]">Auto-Approve Threshold:</span>
                  <span className="font-mono font-bold text-emerald-800">&ge; 85% &amp; No Fraud</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-md border border-[#9E98A8]">
                  <span className="text-[#46434D]">Human Handoff Threshold:</span>
                  <span className="font-mono font-bold text-amber-800">&lt; 85% or Name Variance</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-md border border-[#9E98A8]">
                  <span className="text-[#46434D]">Offline Queue Deduplication:</span>
                  <span className="font-mono font-bold text-[#859114]">IndexedDB + Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Hackathon Challenges Coverage Banner */}
      <section className="max-w-7xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#CBC6D3] rounded-lg p-5 border border-[#9E98A8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#859114]" />
            <h3 className="text-sm font-bold text-[#1C1B1F] uppercase tracking-wider">
              AI Hackathon Evaluation Rubrics (Challenges 01 to 08 Covered)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">01. Cost of Being Wrong</div>
              <div className="text-[11px] text-[#46434D]">Asymmetric risk router, safe officer handoff</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">02. Changing Rules</div>
              <div className="text-[11px] text-[#46434D]">Digital Twin simulation on past claims</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">03. Messy Real World</div>
              <div className="text-[11px] text-[#46434D]">Pakistani phonetic name matching</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">04. Low Connectivity</div>
              <div className="text-[11px] text-[#46434D]">40-family kiosk, offline queue &amp; sync</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">05. Low Literacy</div>
              <div className="text-[11px] text-[#46434D]">Urdu &amp; English voice STT/TTS</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">06. Data Sovereignty</div>
              <div className="text-[11px] text-[#46434D]">Consent lifecycle (See, Share, Revoke, Correct)</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">07. Scams &amp; Forgery</div>
              <div className="text-[11px] text-[#46434D]">Fake 8171 detection, OCR tamper check</div>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-[#9E98A8]">
              <div className="font-bold text-[#859114]">08. Explainability</div>
              <div className="text-[11px] text-[#46434D]">Dual citizen plain notice + auditor trace</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Multi-Role Workspaces Launchpad */}
      <section className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-[#1C1B1F]">
            Select a Role Workspace to Test
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#46434D]">
            Switch between all 5 stakeholder roles with full server-side authorization and mock identity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Citizen */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <UserCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">1. Citizen View</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">Rashida Bibi (Widow)</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Voice-first interface with extra-large touch targets, Urdu/English speech synthesis, camera CNIC scan, fake 8171 SMS scam checker, and complete consent withdrawal controls.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('citizen', '/citizen')}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Launch Citizen View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Community Helper */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">2. Community Helper</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">Khadija Parveen (Mobilizer)</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Designed for 1 shared smartphone serving 40 families. Quick family switcher with strict consent checks (blocked if consent revoked) and offline-first queue syncing.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('helper', '/helper')}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Launch Helper View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Officer Queue */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">3. Officer Review Queue</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">Tariq Mehmood (Welfare Officer)</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Priority review sorted by <strong>Lowest Confidence First</strong>. Side-by-side view with uploaded document, AI extracted JSON, fuzzy name match warnings, and Assign/Escalate/Close actions.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('officer', '/officer')}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Launch Officer Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Policy Admin & Digital Twin */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">4. Admin &amp; Digital Twin</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">Zainab Abbas (Policy Director)</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Live Rule Editor + Digital Twin Simulator. Modify income ceilings or thresholds and preview how past cases would flip before committing a new version.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('admin', '/admin')}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Launch Admin &amp; Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. Auditor & Trace */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">5. Auditor &amp; Trace</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">Farooq Ahmed (State Auditor)</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Read-only compliance dashboard with immutable audit logs, consent revocation timeline, AI Accuracy, False Positive Rate, and anomaly detection graphs.
              </p>
            </div>
            <button
              onClick={() => handleLaunchRole('auditor', '/auditor')}
              className="w-full bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Launch Auditor View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6. REST API & Swagger */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-white border border-[#9E98A8] flex items-center justify-center text-[#859114] mb-3">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1C1B1F]">6. Public REST API &amp; Docs</h3>
              <p className="text-xs font-bold text-[#859114] mb-1.5">OpenAPI 3.0 &amp; API Keys</p>
              <p className="text-xs text-[#46434D] leading-relaxed mb-4">
                Complete Swagger-compliant REST API documentation with API Key generation, rate limit monitoring, and interactive test console.
              </p>
            </div>
            <Link
              href="/docs"
              className="w-full bg-[#1C1B1F] hover:bg-black text-white font-bold py-2.5 px-3 rounded-md text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <span>Open API Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
