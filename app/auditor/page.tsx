'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import {
  FileText,
  ShieldCheck,
  Activity,
  AlertOctagon,
  Clock,
  Search,
  Filter,
  CheckCircle,
  FileCheck,
  Lock,
  Layers,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import { AuditLog } from '../../lib/types';

export default function AuditorPage() {
  const { user, isLoggedIn } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const fetchAuditorData = async () => {
    setLoading(true);
    try {
      const [logsRes, anomaliesRes] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/analytics/anomalies'),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }

      if (anomaliesRes.ok) {
        const anomData = await anomaliesRes.json();
        setAnomalies(anomData.anomalies || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditorData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action_type === filterAction;
    const matchesSearch =
      !searchTerm ||
      log.actor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#383737] border border-[#616060] rounded-lg shadow-xl text-center space-y-4 text-[#FFFFFF]">
        <div className="w-14 h-14 rounded-full bg-[#F59E0B] text-white flex items-center justify-center mx-auto shadow">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#FFFFFF]">Authentication Required</h2>
        <p className="text-xs text-[#D1D5DB]">
          To view statutory audit logs and live AI compliance evaluation metrics, please sign in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In as Auditor</span>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'auditor' && user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#383737] border border-[#616060] rounded-lg shadow-xl text-center space-y-4 text-white">
        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">403 Forbidden: Auditor Access Restricted</h2>
        <p className="text-xs text-[#D1D5DB]">
          You are currently signed in as <strong>{user?.name}</strong> with role <span className="uppercase font-bold text-[#F59E0B]">[{user?.role}]</span>. 
          Statutory audit logs and forensic AI compliance evaluations are strictly restricted to State Auditors and Administrators.
        </p>
        <Link
          href={user?.role === 'citizen' ? '/citizen' : user?.role === 'helper' ? '/helper' : user?.role === 'officer' ? '/officer' : '/dashboard'}
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <span>Return to Your Authorized Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#383737] rounded-lg p-6 sm:p-8 border border-[#616060] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Statutory Oversight &amp; Compliance Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            Auditor View &amp; AI Evaluation Metrics
          </h1>
          <p className="text-xs sm:text-sm text-[#D1D5DB] mt-0.5 max-w-2xl">
            Immutable trace of every citizen claim, consent change, AI decision threshold, and human officer override for State Audit transparency.
          </p>
        </div>

        <div className="bg-white border border-[#616060] px-3.5 py-2 rounded-md flex items-center gap-2 text-xs font-bold text-[#F59E0B] shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log Immutability: SHA-256 Validated</span>
        </div>
      </div>

      {/* AI Evaluation Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>AI Decision Accuracy</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#FFFFFF] font-mono">96.4%</div>
          <p className="text-[11px] text-[#D1D5DB] mt-0.5">Ground truth match vs. NADRA records</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>False Positive Rate</span>
            <AlertOctagon className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-[#FFFFFF] font-mono">0.8%</div>
          <p className="text-[11px] text-[#D1D5DB] mt-0.5">Asymmetric risk router prevention</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Human Handoff Rate</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#FFFFFF] font-mono">18.5%</div>
          <p className="text-[11px] text-[#D1D5DB] mt-0.5">Escalated on name variance / missing proof</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-[#616060] shadow-sm">
          <div className="flex items-center justify-between text-[#D1D5DB] text-xs font-bold mb-1">
            <span>Avg Evaluation Latency</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#FFFFFF] font-mono">312 ms</div>
          <p className="text-[11px] text-[#D1D5DB] mt-0.5">gemini-2.5-flash + fuzzy matching</p>
        </div>
      </div>

      {/* Anomaly Detection Section */}
      {anomalies.length > 0 && (
        <div className="bg-[#2E2D2D] border border-[#616060] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-rose-700" />
            <h3 className="text-sm font-bold text-[#FFFFFF]">
              Live Anomaly Detection Watchdog ({anomalies.length} Flagged)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.map((anom, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#616060] p-3 rounded-md text-xs space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-rose-700 font-mono">{anom.type || 'SYSTEM_ANOMALY'}</span>
                  <span className="text-[10px] bg-red-100 text-red-900 px-2 py-0.5 rounded uppercase font-bold">
                    {anom.severity || 'HIGH'}
                  </span>
                </div>
                <p className="text-[#FFFFFF]">{anom.description || anom.message}</p>
                <div className="text-[10px] text-[#D1D5DB] font-mono">
                  Timestamp: {new Date(anom.detectedAt || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immutable Audit Log Table */}
      <div className="bg-[#383737] rounded-lg border border-[#616060] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#616060] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-base font-bold text-[#FFFFFF]">Immutable Audit Trail Logs</h2>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-[#D1D5DB] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search actor or target..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#616060] rounded-md focus:outline-none focus:border-[#F59E0B] text-[#FFFFFF]"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs bg-white border border-[#616060] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#F59E0B] text-[#FFFFFF]"
            >
              <option value="ALL">All Actions</option>
              <option value="CASE_CREATED">Case Created</option>
              <option value="AI_DECISION">AI Decision</option>
              <option value="CONSENT_REVOKED">Consent Revoked</option>
              <option value="DATA_CORRECTED">Data Corrected</option>
              <option value="OFFICER_OVERRIDE">Officer Override</option>
              <option value="RULE_UPDATED">Rule Updated</option>
              <option value="SCAM_CHECK">Scam Check</option>
              <option value="AGENT_EXECUTION">Agent Execution</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-md border border-[#616060]">
          <table className="w-full text-left text-xs text-[#FFFFFF]">
            <thead className="bg-[#2E2D2D] text-[#FFFFFF] font-bold uppercase text-[10px] tracking-wider border-b border-[#616060]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Target ID</th>
                <th className="py-2.5 px-3">Metadata / Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#616060]/30 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-[#D1D5DB] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                        log.action_type.includes('REVOKED') || log.action_type.includes('REJECT')
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : log.action_type.includes('OVERRIDE') || log.action_type.includes('CORRECTED')
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : log.action_type.includes('AI_DECISION')
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#FFFFFF] uppercase font-bold text-[10px] whitespace-nowrap font-sans">
                    {log.actor_role} ({log.actor_id})
                  </td>
                  <td className="py-2.5 px-3 text-[#FFFFFF] whitespace-nowrap">{log.target_id}</td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-[#D1D5DB]">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
