'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import {
  Cpu,
  Sliders,
  Play,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Lock,
  LogIn,
} from 'lucide-react';
import { RuleVersion } from '../../lib/types';

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth();
  const [activeRule, setActiveRule] = useState<RuleVersion | null>(null);
  const [ruleVersions, setRuleVersions] = useState<RuleVersion[]>([]);
  const [maxIncome, setMaxIncome] = useState(30000);
  const [autoThreshold, setAutoThreshold] = useState(0.85);
  const [humanThreshold, setHumanThreshold] = useState(0.5);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules');
      if (res.ok) {
        const data = await res.json();
        setActiveRule(data.activeRule);
        setRuleVersions(data.allVersions || []);
        if (data.activeRule) {
          setMaxIncome(data.activeRule.max_monthly_income);
          setAutoThreshold(data.activeRule.auto_approve_threshold);
          setHumanThreshold(data.activeRule.human_handoff_threshold);
        }
      }
    } catch {
      setError('Failed to fetch rules');
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleRunDigitalTwinSimulation = async () => {
    setSimulating(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/rules/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_monthly_income: Number(maxIncome),
          auto_approve_threshold: Number(autoThreshold),
          human_handoff_threshold: Number(humanThreshold),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Simulation error');
      setSimulationResult(data);
      setMessage(`Digital Twin simulation completed on ${data.totalCasesEvaluated || 2} historical cases!`);
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveNewRuleVersion = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_monthly_income: Number(maxIncome),
          auto_approve_threshold: Number(autoThreshold),
          human_handoff_threshold: Number(humanThreshold),
          min_poverty_score: 0,
          required_docs: ['CNIC', 'Death Certificate of Husband'],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save error');

      setMessage(`Success: Policy Rule Version ${data.rule.version_number} is now LIVE in production!`);
      setActiveRule(data.rule);
      fetchRules();
    } catch (err: any) {
      setError(err.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#383737] border border-[#616060] rounded-lg shadow-xl text-center space-y-4 text-[#FFFFFF]">
        <div className="w-14 h-14 rounded-full bg-[#F59E0B] text-white flex items-center justify-center mx-auto shadow">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#FFFFFF]">Authentication Required</h2>
        <p className="text-xs text-[#D1D5DB]">
          Policy administration and Digital Twin simulation requires an authenticated session.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In as Admin</span>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#383737] border border-[#616060] rounded-lg shadow-xl text-center space-y-4 text-white">
        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">403 Forbidden: Admin Access Denied</h2>
        <p className="text-xs text-[#D1D5DB]">
          You are currently signed in as <strong>{user?.name}</strong> with role <span className="uppercase font-bold text-[#F59E0B]">[{user?.role}]</span>. 
          Policy rule configuration and Digital Twin simulations are strictly restricted to System Administrators.
        </p>
        <Link
          href={user?.role === 'citizen' ? '/citizen' : user?.role === 'helper' ? '/helper' : user?.role === 'officer' ? '/officer' : user?.role === 'auditor' ? '/auditor' : '/dashboard'}
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <span>Return to Your Authorized Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#FFFFFF]">
      {/* Page Header */}
      <div className="bg-[#383737] rounded-lg p-6 sm:p-8 border border-[#616060] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Policy Administration &amp; Sandbox Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FFFFFF]">
            Live Rule Editor &amp; Digital Twin Simulator
          </h1>
          <p className="text-xs sm:text-sm text-[#D1D5DB] mt-1 max-w-2xl">
            Simulate policy changes across historical cases to predict approval flips and budgetary impact before committing a new policy version to production.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-md border border-[#616060] shadow-sm">
          <History className="w-4 h-4 text-[#F59E0B]" />
          <div className="text-xs">
            <div className="text-[#D1D5DB]">Current Live Version</div>
            <div className="font-bold text-[#FFFFFF] font-mono">
              v{activeRule?.version_number || 1} ({activeRule?.id || 'rule-v1'})
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-100 border border-red-300 text-red-950 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Live Rule Controls vs Digital Twin Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Parameter Controls */}
        <div className="bg-[#383737] rounded-lg border border-[#616060] shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#616060] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-base font-bold text-[#FFFFFF]">Policy Parameter Knobs</h2>
            </div>
            <span className="text-[11px] font-mono bg-white text-[#F59E0B] px-2 py-0.5 rounded border border-[#616060] font-bold">
              Dynamic (No Code Change)
            </span>
          </div>

          {/* 1. Maximum Monthly Income */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#FFFFFF]">
              <label>Maximum Monthly Household Income (PKR)</label>
              <span className="font-mono text-white bg-[#F59E0B] px-2 py-0.5 rounded font-bold">
                PKR {maxIncome.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="75000"
              step="1000"
              value={maxIncome}
              onChange={(e) => setMaxIncome(Number(e.target.value))}
              className="w-full accent-[#F59E0B] h-2 bg-white rounded cursor-pointer border border-[#616060]"
            />
            <p className="text-[11px] text-[#D1D5DB] mt-1">
              Applicants with reported or NADRA income exceeding this ceiling are rejected.
            </p>
          </div>

          {/* 2. Auto Approve Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#FFFFFF]">
              <label>AI Auto-Approve Confidence Threshold</label>
              <span className="font-mono text-white bg-emerald-700 px-2 py-0.5 rounded font-bold">
                {Math.round(autoThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.98"
              step="0.01"
              value={autoThreshold}
              onChange={(e) => setAutoThreshold(Number(e.target.value))}
              className="w-full accent-emerald-700 h-2 bg-white rounded cursor-pointer border border-[#616060]"
            />
            <p className="text-[11px] text-[#D1D5DB] mt-1">
              Minimum composite score required to trigger instant Raast disbursement without human intervention.
            </p>
          </div>

          {/* 3. Human Handoff Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-[#FFFFFF]">
              <label>Human Officer Handoff Threshold</label>
              <span className="font-mono text-white bg-amber-700 px-2 py-0.5 rounded font-bold">
                {Math.round(humanThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.80"
              step="0.01"
              value={humanThreshold}
              onChange={(e) => setHumanThreshold(Number(e.target.value))}
              className="w-full accent-amber-700 h-2 bg-white rounded cursor-pointer border border-[#616060]"
            />
            <p className="text-[11px] text-[#D1D5DB] mt-1">
              Cases falling below auto-approve but above this floor are sent to Welfare Officer Tariq&apos;s queue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRunDigitalTwinSimulation}
              disabled={simulating}
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 px-4 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
              <span>Simulate on Past Cases (Digital Twin)</span>
            </button>

            <button
              type="button"
              onClick={handleSaveNewRuleVersion}
              disabled={saving}
              className="flex-1 bg-[#FFFFFF] hover:bg-black text-white font-bold py-3 px-4 rounded-md text-xs flex items-center justify-center gap-2 transition shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Activate Version</span>
            </button>
          </div>
        </div>

        {/* Right: Digital Twin Simulation Results */}
        <div className="bg-[#2E2D2D] rounded-lg border border-[#616060] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#616060] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-base font-bold text-[#FFFFFF]">Digital Twin Preview &amp; Impact</h2>
              </div>
              <span className="text-[11px] text-[#D1D5DB] font-mono">Sandbox Replay</span>
            </div>

            {simulationResult ? (
              <div className="space-y-5">
                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-[#616060] p-3 rounded-md text-center shadow-sm">
                    <div className="text-[11px] font-bold text-emerald-800">Auto-Approved</div>
                    <div className="text-2xl font-black text-[#FFFFFF] mt-0.5">
                      {simulationResult.predictedStatusCounts?.auto_approved ?? 1}
                    </div>
                  </div>
                  <div className="bg-white border border-[#616060] p-3 rounded-md text-center shadow-sm">
                    <div className="text-[11px] font-bold text-amber-800">Human Handoff</div>
                    <div className="text-2xl font-black text-[#FFFFFF] mt-0.5">
                      {simulationResult.predictedStatusCounts?.human_review ?? 1}
                    </div>
                  </div>
                  <div className="bg-white border border-[#616060] p-3 rounded-md text-center shadow-sm">
                    <div className="text-[11px] font-bold text-rose-800">Rejected</div>
                    <div className="text-2xl font-black text-[#FFFFFF] mt-0.5">
                      {simulationResult.predictedStatusCounts?.rejected ?? 0}
                    </div>
                  </div>
                </div>

                {/* Status Flips Table */}
                <div>
                  <h4 className="text-xs font-bold text-[#FFFFFF] mb-2 flex items-center gap-1.5">
                    <span>Predicted Decision Flips:</span>
                    <span className="bg-[#F59E0B] text-white font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                      {simulationResult.flips?.length || 0} cases affected
                    </span>
                  </h4>

                  {simulationResult.flips && simulationResult.flips.length > 0 ? (
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {simulationResult.flips.map((flip: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#616060] p-3 rounded-md text-xs flex items-center justify-between shadow-sm"
                        >
                          <div>
                            <div className="font-bold text-[#FFFFFF]">{flip.citizenName || flip.caseId}</div>
                            <div className="text-[11px] text-[#D1D5DB]">Reason: {flip.reason}</div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="line-through text-[#D1D5DB]">{flip.oldStatus}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span className="font-bold text-[#F59E0B]">{flip.newStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#D1D5DB] italic bg-white p-4 rounded-md border border-[#616060] text-center">
                      No historical cases flip status with these parameter values.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-3 bg-white/50 rounded-md border border-[#616060]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#F59E0B] shadow border border-[#616060]">
                  <Play className="w-5 h-5 ml-0.5 fill-[#F59E0B]" />
                </div>
                <h3 className="text-sm font-bold text-[#FFFFFF]">No Simulation Run Yet</h3>
                <p className="text-xs text-[#D1D5DB] max-w-sm mx-auto">
                  Adjust the policy knobs on the left and click &ldquo;Simulate on Past Cases&rdquo; to test safety thresholds against historical claims.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-[#616060] flex items-center justify-between text-[11px] text-[#D1D5DB]">
            <span>Audit Trail Policy Hash: SHA256-DPI</span>
            <span>Policy Admin: Zainab Abbas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
