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
  const { user, language, isOnline, speak } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState('bisp_relief_wing');
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Autonomous Agent quick-run state
  const [agentGoalCnic, setAgentGoalCnic] = useState('42101-1234567-8');
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
          goal: `Autonomously evaluate relief claim, verify identity, and settle Raast payment for ${agentGoalCnic}`,
        }),
      });
      const data = await res.json();
      if (data.execution) {
        setAgentResult(data.execution);
        speak(`Agent completed workflow. Outcome: ${data.execution.finalOutcome}`, language);
      }
    } catch (e) {
      console.error('Agent execution failed', e);
    } finally {
      setIsAgentRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Multi-Tenant Banner */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#2A2663] to-[#1E1B4B] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>SahulatRail DPI Dashboard &bull; Team Thunder</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {language === 'ur'
              ? `خوش آمدید، ${user?.name || 'صارف'}`
              : `Welcome to Command Center, ${user?.name || 'Officer'}`}
          </h1>

          <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Multi-tenant digital public infrastructure routing emergency grants, enforcing citizen consent, detecting cyber scams, and executing autonomous relief agent workflows.
          </p>
        </div>

        {/* Tenant Workspace Selector */}
        <div className="bg-slate-900/80 backdrop-blur p-4 rounded-2xl border border-indigo-700/60 space-y-2 lg:w-72 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Active Workspace</span>
            </span>
          </div>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="w-full bg-indigo-950 text-white font-extrabold text-xs p-2.5 rounded-xl border border-indigo-600 focus:outline-none cursor-pointer"
          >
            <option value="bisp_relief_wing">Federal BISP Relief Taskforce</option>
            <option value="sindh_disaster_desk">Sindh Flood Emergency Authority</option>
            <option value="punjab_social_protect">Punjab Social Protection Bureau</option>
            <option value="kpk_relief_command">KPK Drought Facilitation Desk</option>
          </select>

          <div className="text-[10px] text-amber-300/80 flex items-center justify-between pt-1">
            <span>Isolated Tenant Space</span>
            <span className="font-mono">Status: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Total Applications</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {analytics.metrics.totalApplications}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active DPI Registry</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Auto-Approval Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950">
              {analytics.metrics.autoApprovalRate}%
            </div>
            <div className="text-[11px] text-slate-500">
              Confidence threshold &ge; 85%
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Human Handoff Rate</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-blue-950">
              {analytics.metrics.humanHandoffRate}%
            </div>
            <div className="text-[11px] text-blue-700 font-bold">
              Safeguard: &ldquo;I Am Not Sure&rdquo;
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Total Disbursed</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 truncate">
              PKR {analytics.metrics.totalDisbursedPkr.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Direct Raast Settlement
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Autonomous Agent Runner & Multi-Role Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Autonomous DPI Agent Runner */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-black text-slate-900 text-base">Autonomous DPI Relief Agent</h3>
                <div className="text-[11px] text-slate-500">
                  Decomposes relief claims into sequential tool calls (verify, evaluate, settle, notify)
                </div>
              </div>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded">
              LangGraph Pattern
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={agentGoalCnic}
                onChange={(e) => setAgentGoalCnic(e.target.value)}
                placeholder="Enter CNIC (e.g. 42101-1234567-8)"
                className="flex-1 h-11 px-4 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:border-indigo-600"
              />
              <button
                onClick={handleRunAutonomousAgent}
                disabled={isAgentRunning}
                className="touch-target-xl px-5 py-2.5 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-black rounded-xl text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAgentRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Tools...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Autonomous Agent</span>
                  </>
                )}
              </button>
            </div>

            {agentResult && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 text-xs animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-indigo-950">
                  <span>Task Execution: {agentResult.taskId}</span>
                  <span className="text-[11px] text-indigo-700 font-mono">{agentResult.totalLatencyMs} ms</span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  {agentResult.steps.map((st: any) => (
                    <div key={st.stepNumber} className="p-2.5 bg-white rounded-xl border border-indigo-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-900">
                          Step {st.stepNumber}: Tool <code>{st.tool}</code>
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                            st.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.status === 'ESCALATED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                      <p className="text-slate-600 font-sans text-xs">{st.thought}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white border border-indigo-200 font-bold text-slate-900 text-xs">
                  <strong>Final Outcome:</strong> {agentResult.finalOutcome}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Role Quick Links & Background Jobs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Workspaces Navigation */}
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
              Multi-Role Workspace Hub
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/citizen"
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">Citizen View</div>
                  <div className="text-[10px] text-slate-500">Voice-first &amp; low literacy</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/helper"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">Helper Mode</div>
                  <div className="text-[10px] text-slate-500">40 families offline queue</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/officer"
                className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">Officer Queue</div>
                  <div className="text-[10px] text-slate-500">Lowest confidence first</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/admin"
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">Digital Twin</div>
                  <div className="text-[10px] text-slate-500">Live rule simulator</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* SaaS Subscriptions & Usage Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">SaaS Plan &amp; Rate Limits</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                NGO Relief Tier
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Cases Quota</span>
                <span className="font-bold text-slate-900">24 / 5,000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>

              <div className="flex justify-between text-slate-600 pt-1">
                <span>Rate Limit Gauge</span>
                <span className="font-bold text-emerald-700">120 req / min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
