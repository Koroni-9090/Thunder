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
  Shield,
  UserCheck2,
  FileCheck,
  Cpu,
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-white">
      {/* Welcome Banner */}
      <div className="bg-[#383737] rounded-lg p-6 sm:p-8 border border-[#616060] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#2E2D2D] px-2.5 py-0.5 rounded-md mb-2 border border-[#616060] w-fit">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            <span>CENTRAL DPI COMMAND &bull; TEAM THUNDER</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            SahulatRail Command Center
          </h1>
          <p className="text-[#D1D5DB] text-xs sm:text-sm mt-0.5 max-w-2xl">
            Live multi-tenant monitoring across provincial relief taskforces, SBP Raast instant settlements, and the Asymmetric Risk Router.
          </p>
        </div>

        {/* Tenant Selector */}
        <div className="flex items-center gap-2 bg-[#2E2D2D] px-3 py-2 rounded-md border border-[#616060] shadow-sm">
          <Building2 className="w-4 h-4 text-[#F59E0B]" />
          <div className="text-xs">
            <label className="text-[10px] uppercase font-bold text-[#D1D5DB] block">
              Active Tenant
            </label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-transparent font-bold text-xs text-white focus:outline-none"
            >
              <option value="bisp_relief_wing" className="bg-[#2E2D2D] text-white">Federal BISP Relief Taskforce</option>
              <option value="sindh_disaster_desk" className="bg-[#2E2D2D] text-white">Sindh Flood Emergency Authority</option>
              <option value="punjab_social_protect" className="bg-[#2E2D2D] text-white">Punjab Social Protection Bureau</option>
              <option value="kpk_relief_command" className="bg-[#2E2D2D] text-white">KPK Drought Facilitation Desk</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#383737] rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Total Relief Claims</span>
            <FileText className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {metrics.totalApplications}
          </div>
          <div className="text-[11px] text-[#D1D5DB] mt-0.5">Real-time claim pipeline</div>
        </div>

        <div className="bg-[#383737] rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Auto-Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {metrics.autoApprovalRate}%
          </div>
          <div className="text-[11px] text-[#D1D5DB] mt-0.5">&ge; 85% high confidence threshold</div>
        </div>

        <div className="bg-[#383737] rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Human Handoff Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {metrics.humanHandoffRate}%
          </div>
          <div className="text-[11px] text-[#D1D5DB] mt-0.5">&ldquo;I Am Not Sure&rdquo; safe handoffs</div>
        </div>

        <div className="bg-[#383737] rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Raast Settled (PKR)</span>
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            PKR {metrics.totalDisbursedPkr.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#D1D5DB] mt-0.5">Instant SBP settlement</div>
        </div>
      </div>

      {/* Autonomous DPI Agent Runner (Interactive Demo) */}
      <div className="bg-[#383737] rounded-lg p-6 border border-[#616060] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#616060] pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-base font-bold text-white">
              Autonomous DPI Agent Runner (Plan &amp; Execute)
            </h2>
          </div>
          <span className="text-[10px] bg-[#2E2D2D] text-[#FEF08A] font-bold px-2 py-0.5 rounded border border-[#616060]">
            Sequential Tool Calling
          </span>
        </div>

        <p className="text-xs text-[#D1D5DB]">
          Test the end-to-end autonomous agent invoking <code>verify_identity</code>, <code>evaluate_rules</code>, <code>disburse_raast</code>, and <code>send_notification</code>.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={agentGoalCnic}
            onChange={(e) => setAgentGoalCnic(e.target.value)}
            placeholder="Target CNIC (e.g. 35201-1234567-8)"
            className="flex-1 px-3 py-2 bg-[#2A2929] border border-[#616060] rounded-md text-xs font-mono text-white focus:outline-none focus:border-[#859114]"
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
                <Zap className="w-4 h-4 text-[#FEF08A]" />
                <span>Execute Autonomous Agent</span>
              </>
            )}
          </button>
        </div>

        {agentResult && (
          <div className="p-4 bg-[#2E2D2D] rounded-md border border-[#616060] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Task ID: {agentResult.taskId}</span>
              <span className="text-[10px] text-[#D1D5DB]">
                Latency: {agentResult.totalLatencyMs}ms
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-[#FEF08A]">Execution Trace Steps:</div>
              {agentResult.steps?.map((step: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-[#383737] rounded-md border border-[#616060]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-white">
                    <span>
                      Step {step.stepNumber}: Tool <code>{step.tool}</code>
                    </span>
                    <span className="font-bold text-emerald-400">{step.status}</span>
                  </div>
                  <p className="text-[11px] text-[#D1D5DB] mt-1">{step.thought}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#383737] rounded-md border border-[#616060] text-xs">
              <span className="font-bold text-white">Final Autonomous Outcome:</span>
              <p className="text-[#D1D5DB] mt-0.5">{agentResult.finalOutcome}</p>
            </div>
          </div>
        )}
      </div>

      {/* Role Workspace Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/citizen"
          className="p-4 bg-[#383737] hover:bg-[#4A4949] rounded-lg border border-[#616060] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-white">Citizen Portal</div>
            <div className="text-[11px] text-[#D1D5DB]">Voice-first claims &amp; scam checker</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#FEF08A] transition-colors" />
        </Link>

        <Link
          href="/helper"
          className="p-4 bg-[#383737] hover:bg-[#4A4949] rounded-lg border border-[#616060] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-white">Community Helper</div>
            <div className="text-[11px] text-[#D1D5DB]">40 families &amp; offline queue</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#FEF08A] transition-colors" />
        </Link>

        <Link
          href="/officer"
          className="p-4 bg-[#383737] hover:bg-[#4A4949] rounded-lg border border-[#616060] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-white">Officer Queue</div>
            <div className="text-[11px] text-[#D1D5DB]">Lowest confidence first review</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#FEF08A] transition-colors" />
        </Link>

        <Link
          href="/admin"
          className="p-4 bg-[#383737] hover:bg-[#4A4949] rounded-lg border border-[#616060] shadow-sm transition flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-sm text-white">Policy &amp; Twin</div>
            <div className="text-[11px] text-[#D1D5DB]">Digital twin simulation</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#FEF08A] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
