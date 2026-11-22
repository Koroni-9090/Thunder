'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Scale,
  ShieldAlert,
  UserCheck,
  Send,
  Lock,
  ArrowUpRight,
  Upload,
  LogIn,
} from 'lucide-react';
import { CaseRecord } from '@/lib/types';

export default function OfficerPage() {
  const { user, isLoggedIn, language } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decision & Override form
  const [overrideNote, setOverrideNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Case Management Modals
  const [assigneeId, setAssigneeId] = useState('usr-helper-1');
  const [assigneeRole, setAssigneeRole] = useState<'helper' | 'officer'>('helper');
  const [escalationReason, setEscalationReason] = useState('Uncertain Pakistani transliteration variance requiring senior supervisor approval');
  const [resolutionSummary, setResolutionSummary] = useState('Verified physical union council death certificate for widow grant');

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cases', {
        headers: {
          'x-sahulat-user-id': user?.id || 'usr-officer-1',
        },
      });
      const data = await res.json();
      if (data.cases) {
        // Sort lowest confidence first
        const sorted = [...data.cases].sort((a, b) => a.confidence_score - b.confidence_score);
        setCases(sorted);
        if (sorted.length > 0 && !selectedCase) {
          setSelectedCase(sorted[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch officer queue', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOfficerDecision = async (action: 'approve' | 'reject') => {
    if (!selectedCase) return;
    if (!overrideNote.trim()) {
      setActionAlert({ type: 'error', text: 'Mandatory officerNotes required for audit trail override' });
      return;
    }

    setIsSubmitting(true);
    setActionAlert(null);

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, officerNotes: overrideNote }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Override failed');

      setActionAlert({
        type: 'success',
        text: `Case #${selectedCase.id} successfully ${action === 'approve' ? 'APPROVED' : 'REJECTED'}. Audit trail logged.`,
      });
      setOverrideNote('');
      await fetchCases();
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message || 'Error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId, assigneeRole, notes: 'Assigned for ground verification' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({ type: 'success', text: `Case assigned to ${assigneeId} (${assigneeRole}).` });
        await fetchCases();
      }
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationReason, supervisorRole: 'SENIOR_DESK_DIRECTOR' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({ type: 'success', text: 'Case escalated to Senior Supervisor queue.' });
        await fetchCases();
      }
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async (finalStatus: 'approved' | 'rejected') => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionSummary, finalStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({ type: 'success', text: `Case closed as ${finalStatus.toUpperCase()}. Payment & audit finalized.` });
        await fetchCases();
      }
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
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
          To review low-confidence claims and execute officer overrides, please sign in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In as Welfare Officer</span>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'officer' && user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#383737] border border-[#616060] rounded-lg shadow-xl text-center space-y-4 text-white">
        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">403 Forbidden: Officer Access Denied</h2>
        <p className="text-xs text-[#D1D5DB]">
          You are currently signed in as <strong>{user?.name}</strong> with role <span className="uppercase font-bold text-[#F59E0B]">[{user?.role}]</span>. 
          Case verification, audit override, and relief claim decisions are strictly restricted to Welfare Officers and Administrators.
        </p>
        <Link
          href={user?.role === 'citizen' ? '/citizen' : user?.role === 'helper' ? '/helper' : user?.role === 'auditor' ? '/auditor' : '/dashboard'}
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <span>Return to Your Authorized Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#FFFFFF]">
      {/* Officer Header */}
      <div className="bg-[#383737] rounded-lg p-6 border border-[#616060] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-1">
            <Scale className="w-4 h-4" />
            <span>Relief Verification Desk &bull; Team Thunder Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            Case Management &amp; Uncertainty Queue
          </h1>
          <p className="text-[#D1D5DB] text-xs sm:text-sm mt-0.5">
            Sorted by <strong>Lowest Confidence First</strong>. AI escalated cases where composite confidence fell below auto-approval threshold.
          </p>
        </div>

        <button
          onClick={fetchCases}
          className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-4 py-2.5 rounded-md text-xs shadow transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue ({cases.length})</span>
        </button>
      </div>

      {actionAlert && (
        <div
          className={`p-3.5 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm ${
            actionAlert.type === 'success'
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-950'
              : 'bg-rose-100 border border-rose-300 text-rose-950'
          }`}
        >
          {actionAlert.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* Main Grid: Review Queue & Detailed Case Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Review List (Lowest Confidence First) */}
        <div className="lg:col-span-5 bg-[#383737] rounded-lg p-5 border border-[#616060] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#616060] pb-2.5">
            <h2 className="font-bold text-[#FFFFFF] text-sm">Priority Review Queue</h2>
            <span className="text-[10px] bg-[#F59E0B] text-white font-bold px-2 py-0.5 rounded font-mono">
              Lowest Conf First
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-xs text-[#D1D5DB] gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#F59E0B]" />
              <span>Loading review queue...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#D1D5DB]">
              No cases currently pending officer review.
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const confPercent = Math.round(c.confidence_score * 100);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setActionAlert(null);
                    }}
                    className={`w-full text-left p-3 rounded-md border text-xs transition ${
                      isSelected
                        ? 'border-[#F59E0B] bg-white shadow-sm'
                        : 'border-[#616060] bg-[#2E2D2D] hover:border-[#F59E0B]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#FFFFFF]">
                        {c.extracted_data.fullName || c.citizen_name || 'Applicant'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          c.confidence_score < 0.65
                            ? 'bg-rose-100 text-rose-950 border border-rose-300'
                            : c.confidence_score < 0.85
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                        }`}
                      >
                        Confidence: {confPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#D1D5DB] font-mono">
                      <span>{c.cnic_mock || 'Unknown CNIC'}</span>
                      <span className="uppercase text-[10px] font-bold text-[#F59E0B]">
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    {c.auditor_trace?.asymmetricRiskFlags && c.auditor_trace.asymmetricRiskFlags.length > 0 && (
                      <div className="mt-1.5 text-[10px] text-amber-950 bg-amber-100 p-1.5 rounded border border-amber-300 line-clamp-1 font-mono">
                        Flags: {c.auditor_trace.asymmetricRiskFlags.join(', ')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Management Workspace */}
        <div className="lg:col-span-7 bg-[#2E2D2D] rounded-lg p-6 border border-[#616060] shadow-sm space-y-5">
          {selectedCase ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#616060] pb-3">
                <div>
                  <div className="text-xs font-mono text-[#D1D5DB] uppercase">Case ID: {selectedCase.id}</div>
                  <h3 className="text-lg font-bold text-[#FFFFFF]">
                    {selectedCase.extracted_data.fullName || selectedCase.citizen_name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#242323] text-white px-2.5 py-1 rounded-md font-mono border border-[#616060]">
                    Rule: {selectedCase.rule_version_id}
                  </span>
                  <span className="text-xs bg-[#F59E0B] text-white px-2.5 py-1 rounded-md font-bold">
                    Conf: {Math.round(selectedCase.confidence_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Side-by-Side: Extracted JSON vs Auditor Trace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-md border border-[#616060] space-y-1.5">
                  <div className="font-bold text-[#F59E0B] text-[11px] uppercase">
                    Extracted Document Data
                  </div>
                  <div><strong>CNIC:</strong> {selectedCase.cnic_mock}</div>
                  <div><strong>Income:</strong> PKR {selectedCase.extracted_data.monthlyIncome?.toLocaleString()}</div>
                  <div><strong>Widow:</strong> {selectedCase.extracted_data.isWidow ? 'Yes' : 'No'}</div>
                  <div><strong>District:</strong> {selectedCase.extracted_data.district || 'General'}</div>
                  <div><strong>OCR Clarity:</strong> {Math.round((selectedCase.extracted_data.ocrConfidence || 0.94) * 100)}%</div>
                </div>

                <div className="p-3 bg-white rounded-md border border-[#616060] space-y-1.5 font-mono text-[11px]">
                  <div className="font-bold text-[#F59E0B] text-[11px] uppercase font-sans">
                    Auditor Decision Trace
                  </div>
                  <div>Path: {selectedCase.auditor_trace?.decisionPath}</div>
                  <div>Fuzzy: {selectedCase.auditor_trace?.fuzzyMatchScore}</div>
                  <div>Hash: {selectedCase.auditor_trace?.inputHash}</div>
                  <div className="text-amber-800">
                    Flags: {selectedCase.auditor_trace?.asymmetricRiskFlags?.join(', ') || 'None'}
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-3 bg-white rounded-md border border-[#616060] text-xs">
                <div className="font-bold text-[#D1D5DB] text-[10px] uppercase">Plain-Language Citizen Notice:</div>
                <p className="text-[#FFFFFF] font-medium mt-0.5">
                  {language === 'ur' ? selectedCase.citizen_explanation_ur : selectedCase.citizen_explanation_en}
                </p>
              </div>

              {/* Officer Override Action Box */}
              <div className="p-4 bg-white rounded-md border border-[#616060] space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#FFFFFF]">
                  Officer Override &amp; Mandatory Reason Note
                </h4>
                <textarea
                  rows={2}
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="Enter mandatory reasoning note for audit trail (e.g. 'Verified physical union council death certificate for widow grant')..."
                  className="w-full p-2.5 rounded-md border border-[#616060] text-xs text-[#FFFFFF] focus:outline-none focus:border-[#F59E0B]"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOfficerDecision('approve')}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Relief Grant (Disburse Raast)</span>
                  </button>

                  <button
                    onClick={() => handleOfficerDecision('reject')}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              {/* Workflow Actions: Assign, Escalate, Close */}
              <div className="pt-2 border-t border-[#616060] flex flex-wrap gap-2 text-xs">
                <button
                  onClick={handleAssign}
                  disabled={isSubmitting}
                  className="py-1.5 px-3 rounded-md bg-white hover:bg-slate-50 border border-[#616060] font-bold text-[#FFFFFF] shadow-sm"
                >
                  Assign to Field Helper
                </button>

                <button
                  onClick={handleEscalate}
                  disabled={isSubmitting}
                  className="py-1.5 px-3 rounded-md bg-white hover:bg-slate-50 border border-[#616060] font-bold text-[#FFFFFF] shadow-sm"
                >
                  Escalate to Senior Desk
                </button>

                <button
                  onClick={() => handleClose('approved')}
                  disabled={isSubmitting}
                  className="py-1.5 px-3 rounded-md bg-white hover:bg-slate-50 border border-[#616060] font-bold text-[#FFFFFF] shadow-sm"
                >
                  Close Case (Resolved)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#D1D5DB]">
              Select a case from the priority review queue on the left to inspect documents and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
