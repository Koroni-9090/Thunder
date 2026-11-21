'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { RuleVersion } from '../../lib/types';

export default function AdminPage() {
  const { currentUser } = useAuth();
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
          max_monthly_income: maxIncome,
          auto_approve_threshold: autoThreshold,
          human_handoff_threshold: humanThreshold,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Simulation error');
      setSimulationResult(data);
      setMessage(`Digital Twin simulation completed on ${data.totalCasesEvaluated} historical cases!`);
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
          max_monthly_income: maxIncome,
          auto_approve_threshold: autoThreshold,
          human_handoff_threshold: humanThreshold,
          min_poverty_score: 0,
          required_docs: ['CNIC', 'Death Certificate of Husband'],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save error');

      setMessage(`Success: Policy Rule Version ${data.rule.version_number} is now LIVE!`);
      setActiveRule(data.rule);
      fetchRules();
    } catch (err: any) {
      setError(err.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Policy Administration &amp; Sandbox Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Live Rule Editor &amp; Digital Twin Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Simulate policy changes across historical cases to predict approval flips and budgetary impact before committing a new policy version to production.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
          <History className="w-4 h-4 text-amber-400" />
          <div className="text-xs">
            <div className="text-slate-400">Current Live Version</div>
            <div className="font-bold text-white font-mono">
              v{activeRule?.version_number || 1} ({activeRule?.id || 'rule-v1'})
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid: Live Rule Controls vs Digital Twin Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Live Parameter Controls */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Policy Parameter Knobs</h2>
            </div>
            <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              Dynamic (No Code Change)
            </span>
          </div>

          {/* 1. Maximum Monthly Income */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700">
              <label>Maximum Monthly Household Income (PKR)</label>
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
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
              className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Applicants with reported or NADRA income exceeding this ceiling are rejected.
            </p>
          </div>

          {/* 2. Auto Approve Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700">
              <label>AI Auto-Approve Confidence Threshold</label>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
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
              className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum composite score required to trigger instant Raast disbursement without human intervention.
            </p>
          </div>

          {/* 3. Human Handoff Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700">
              <label>Human Officer Handoff Threshold</label>
              <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
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
              className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Cases falling below auto-approve but above this floor are sent to Welfare Officer Tariq&apos;s queue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRunDigitalTwinSimulation}
              disabled={simulating}
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>Simulate on Past Cases (Digital Twin)</span>
            </button>

            <button
              onClick={handleSaveNewRuleVersion}
              disabled={saving}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save &amp; Activate Version</span>
            </button>
          </div>
        </div>

        {/* Right: Digital Twin Simulation Results */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Digital Twin Preview &amp; Impact</h2>
              </div>
              <span className="text-[11px] text-slate-500">Sandbox Replay</span>
            </div>

            {simulationResult ? (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center">
                    <div className="text-[11px] font-bold text-emerald-700">Auto-Approved</div>
                    <div className="text-2xl font-black text-emerald-950 mt-1">
                      {simulationResult.predictedStatusCounts.auto_approved || 0}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center">
                    <div className="text-[11px] font-bold text-amber-700">Human Handoff</div>
                    <div className="text-2xl font-black text-amber-950 mt-1">
                      {simulationResult.predictedStatusCounts.human_review || 0}
                    </div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center">
                    <div className="text-[11px] font-bold text-rose-700">Rejected</div>
                    <div className="text-2xl font-black text-rose-950 mt-1">
                      {simulationResult.predictedStatusCounts.rejected || 0}
                    </div>
                  </div>
                </div>

                {/* Status Flips Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <span>Predicted Decision Flips:</span>
                    <span className="bg-indigo-100 text-indigo-800 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                      {simulationResult.flips?.length || 0} cases affected
                    </span>
                  </h4>

                  {simulationResult.flips && simulationResult.flips.length > 0 ? (
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {simulationResult.flips.map((flip: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{flip.citizenName || flip.caseId}</div>
                            <div className="text-[11px] text-slate-500">Reason: {flip.reason}</div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="line-through text-slate-400">{flip.oldStatus}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-bold text-indigo-700">{flip.newStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                      No past cases flip status with these parameter values.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Play className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Simulation Run Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Adjust the policy knobs on the left and click &ldquo;Simulate on Past Cases&rdquo; to test safety thresholds against historical claims.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Audit Trail Policy Hash: SHA256-DPI</span>
            <span>Signed by Admin Zainab Abbas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
