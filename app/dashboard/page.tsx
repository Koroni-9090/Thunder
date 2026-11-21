'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { ThunderLogo } from '@/components/ThunderLogo';
import {
  Users,
  FileText,
  Sliders,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  CloudUpload,
  Layers,
  Activity,
  Bot,
  RefreshCw,
  Zap,
  Building2,
  Key,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoggedIn, language, isOnline, speak } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState('bisp_relief_wing');
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Autonomous Agent quick-run state
  const [agentGoalCnic, setAgentGoalCnic] = useState('35201-1234567-8');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<any>(null);

  const fetchAnalytics = async (tenantId: string) => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/analytics?tenant=${tenantId}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to load dashboard analytics', e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedTenant);
  }, [selectedTenant]);

  const handleRunAutonomousAgent = async () => {
    setIsAgentRunning(true);
    setAgentResult(null);

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnic: agentGoalCnic,
          goal: `Autonomously evaluate relief grant and settle via Raast for CNIC ${agentGoalCnic}`,
          actorId: user?.id || 'usr-citizen-1',
        }),
      });

      const data = await res.json();
      setAgentResult(data.execution);
      const outcome = data.execution?.finalOutcome || 'Agent execution completed.';
      speak(outcome, language);
    } catch (e) {
      console.error('Autonomous agent execution failed', e);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const metrics = analytics?.metrics || {
    totalApplications: 2,
    autoApprovedCount: 1,
    humanReviewCount: 1,
    rejectedCount: 0,
    autoApprovalRate: 50.0,
    humanHandoffRate: 50.0,
    totalDisbursedPkr: 10500,
    scamMessagesFlagged: 1,
    auditLogEventsCount: 4,
    averageProcessingTimeMs: 312,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#1C1B1F]">
      {/* Welcome Banner */}
      <div className="bg-[#CBC6D3] rounded-lg p-6 sm:p-8 border border-[#9E98A8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#859114] bg-white px-2.5 py-0.5 rounded-md mb-2 border border-[#9E98A8] w-fit">
            <span className="w-2 h-2 rounded-full bg-[#859114] animate-pulse"></span>
            <span>CENTRAL DPI COMMAND &bull; TEAM THUNDER</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1B1F]">
            SahulatRail Command Center
          </h1>
          <p className="text-[#46434D] text-xs sm:text-sm mt-0.5 max-w-2xl">
            Live multi-tenant monitoring across provincial relief taskforces, SBP Raast instant settlements, and the Asymmetric Risk Router.
          </p>
        </div>

        {/* Tenant Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-[#9E98A8] shadow-sm">
          <Building2 className="w-4 h-4 text-[#859114]" />
          <div className="text-xs">
            <label className="text-[10px] uppercase font-bold text-[#46434D] block">
              Active Tenant
            </label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-transparent font-bold text-xs text-[#1C1B1F] focus:outline-none"
            >
              <option value="bisp_relief_wing">Federal BISP Relief Taskforce</option>
              <option value="sindh_disaster_desk">Sindh Flood Emergency Authority</option>
              <option value="punjab_social_protect">Punjab Social Protection Bureau</option>
              <option value="kpk_relief_command">KPK Drought Facilitation Desk</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-[#9E98A8] shadow-sm">
          <div className="flex items-center justify-between text-[#46434D] text-xs font-bold mb-1">
            <span>Total Relief Claims</span>
            <FileText className="w-4 h-4 text-[#859114]" />
          </div>
          <div className="text-2xl font-black text-[#1C1B1F] font-mono">
            {metrics.totalApplications}
          </div>
          <div className="text-[11px] text-[#46434D] mt-0.5">Real-time claim pipeline</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#9E98A8] shadow-sm">
          <div className="flex items-center justify-between text-[#46434D] text-xs font-bold mb-1">
            <span>Auto-Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {metrics.autoApprovalRate}%
          </div>
          <div className="text-[11px] text-[#46434D] mt-0.5">&ge; 85% high confidence threshold</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#9E98A8] shadow-sm">
          <div className="flex items-center justify-between text-[#46434D] text-xs font-bold mb-1">
            <span>Human Handoff Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">
            {metrics.humanHandoffRate}%
          </div>
          <div className="text-[11px] text-[#46434D] mt-0.5">&ldquo;I Am Not Sure&rdquo; safe handoffs</div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#9E98A8] shadow-sm">
          <div className="flex items-center justify-between text-[#46434D] text-xs font-bold mb-1">
            <span>Raast Settled (PKR)</span>
            <TrendingUp className="w-4 h-4 text-[#859114]" />
          </div>
          <div className="text-2xl font-black text-[#1C1B1F] font-mono">
            PKR {metrics.totalDisbursedPkr.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#46434D] mt-0.5">Instant SBP settlement</div>
        </div>
      </div>

      {/* Autonomous DPI Agent Runner (Interactive Demo) */}
      <div className="bg-[#CBC6D3] rounded-lg p-6 border border-[#9E98A8] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#9E98A8] pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#859114]" />
            <h2 className="text-base font-bold text-[#1C1B1F]">
              Autonomous DPI Agent Runner (Plan &amp; Execute)
            </h2>
          </div>
          <span className="text-[10px] bg-white text-[#859114] font-bold px-2 py-0.5 rounded border border-[#9E98A8]">
            Sequential Tool Calling
          </span>
        </div>

        <p className="text-xs text-[#46434D]">
          Test the end-to-end autonomous agent invoking <code>verify_identity</code>, <code>evaluate_rules</code>, <code>disburse_raast</code>, and <code>send_notification</code>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={agentGoalCnic}
            onChange={(e) => setAgentGoalCnic(e.target.value)}
            placeholder="Target CNIC (e.g. 35201-1234567-8)"
            className="flex-1 px-3 py-2 bg-white border border-[#9E98A8] rounded-md text-xs font-mono text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
          />

          <button
            onClick={handleRunAutonomousAgent}
            disabled={isAgentRunning}
            className="bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2 px-5 rounded-md text-xs flex items-center justify-center gap-2 shadow disabled:opacity-50"
          >
            {isAgentRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Agent Executing Plan...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Autonomous Agent</span>
              </>
            )}
          </button>
        </div>

        {agentResult && (
          <div className="p-4 bg-white rounded-md border border-[#9E98A8] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1C1B1F]">
              <span>Task ID: {agentResult.taskId}</span>
              <span className="text-[10px] text-[#46434D]">
                Latency: {agentResult.totalLatencyMs}ms
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-[#859114]">Execution Trace Steps:</div>
              {agentResult.steps?.map((step: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-[#D5D1DC] rounded-md border border-[#9E98A8]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#1C1B1F]">
                    <span>
                      Step {step.stepNumber}: Tool <code>{step.tool}</code>
                    </span>
                    <span className="font-bold text-emerald-800">{step.status}</span>
                  </div>
                  <p className="text-[11px] text-[#46434D] mt-1">{step.thought}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#D5D1DC] rounded-md border border-[#9E98A8] text-xs">
              <span className="font-bold text-[#1C1B1F]">Final Autonomous Outcome:</span>
              <p className="text-[#46434D] mt-0.5">{agentResult.finalOutcome}</p>
            </div>
          </div>
        )}
      </div>

      {/* Role Workspace Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/citizen"
          className="p-4 bg-white hover:bg-slate-50 rounded-lg border border-[#9E98A8] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-[#1C1B1F]">Citizen Portal</div>
            <div className="text-[11px] text-[#46434D]">Voice-first claims &amp; scam checker</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#46434D] group-hover:text-[#859114] transition-colors" />
        </Link>

        <Link
          href="/helper"
          className="p-4 bg-white hover:bg-slate-50 rounded-lg border border-[#9E98A8] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-[#1C1B1F]">Community Helper</div>
            <div className="text-[11px] text-[#46434D]">40 families &amp; offline queue</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#46434D] group-hover:text-[#859114] transition-colors" />
        </Link>

        <Link
          href="/officer"
          className="p-4 bg-white hover:bg-slate-50 rounded-lg border border-[#9E98A8] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-[#1C1B1F]">Officer Queue</div>
            <div className="text-[11px] text-[#46434D]">Lowest confidence first review</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#46434D] group-hover:text-[#859114] transition-colors" />
        </Link>

        <Link
          href="/admin"
          className="p-4 bg-white hover:bg-slate-50 rounded-lg border border-[#9E98A8] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-[#1C1B1F]">Policy &amp; Twin</div>
            <div className="text-[11px] text-[#46434D]">Digital twin simulation</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#46434D] group-hover:text-[#859114] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
