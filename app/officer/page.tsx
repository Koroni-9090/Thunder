'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CaseRecord } from '@/lib/types';

export default function OfficerPage() {
  const { user, language } = useAuth();
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
        setCases(data.cases);
        if (data.cases.length > 0 && !selectedCase) {
          setSelectedCase(data.cases[0]);
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
  }, [user]);

  // Case Action 1: Standard Decision Override (Approve / Reject / Proof)
  const handleDecision = async (status: 'approved' | 'rejected' | 'needs_more_proof') => {
    if (!selectedCase) return;
    if (!overrideNote.trim() || overrideNote.trim().length < 5) {
      setActionAlert({ type: 'error', text: 'A mandatory officer audit note (at least 5 characters) is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sahulat-user-id': user?.id || 'usr-officer-1',
        },
        body: JSON.stringify({ status, notes: overrideNote }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({ type: 'success', text: `Case ${selectedCase.id} updated to '${status.toUpperCase()}'. Audit logged.` });
        setOverrideNote('');
        await fetchCases();
      } else {
        setActionAlert({ type: 'error', text: data.message || 'Action failed' });
      }
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case Action 2: Assign Case to Helper or Officer
  const handleAssignCase = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sahulat-user-id': user?.id || 'usr-officer-1' },
        body: JSON.stringify({ assigneeId, assigneeRole, notes: 'Assigned for local union council field visit' }),
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

  // Case Action 3: Escalate to Senior Supervisor
  const handleEscalateCase = async () => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sahulat-user-id': user?.id || 'usr-officer-1' },
        body: JSON.stringify({ escalationReason, supervisorRole: 'SENIOR_DESK_SUPERVISOR' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({ type: 'success', text: `Case escalated to Senior Supervisor Queue.` });
        await fetchCases();
      }
    } catch (e: any) {
      setActionAlert({ type: 'error', text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case Action 4: Close Case with Resolution
  const handleCloseCase = async (finalStatus: 'approved' | 'rejected') => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${selectedCase.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sahulat-user-id': user?.id || 'usr-officer-1' },
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Officer Header */}
      <div className="bg-white rounded-3xl p-6 border-2 border-indigo-600/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800 mb-1">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>Relief Verification Desk &bull; Team Thunder Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Case Management &amp; Uncertainty Queue
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Sorted by <strong>Lowest Confidence First</strong>. AI escalated cases where composite confidence fell below auto-approval threshold.
          </p>
        </div>

        <button
          onClick={fetchCases}
          className="flex items-center gap-2 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue ({cases.length})</span>
        </button>
      </div>

      {actionAlert && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border border-rose-300 text-rose-950'
          }`}
        >
          {actionAlert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* Main Grid: Review Queue & Detailed Case Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Review List (Lowest Confidence First) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-black text-slate-900 text-sm sm:text-base">Uncertainty Review Queue</h2>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
              Lowest Conf First
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-xs text-slate-500 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading review queue...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No cases currently pending officer review.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const confPercent = (c.confidence_score * 100).toFixed(0);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setActionAlert(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900">
                        {c.extracted_data.name || 'Applicant'}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          c.confidence_score < 0.65
                            ? 'bg-rose-100 text-rose-800'
                            : c.confidence_score < 0.85
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Confidence: {confPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{c.extracted_data.cnic || 'Unknown CNIC'}</span>
                      <span className="uppercase text-[10px] font-bold text-indigo-700">
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    {c.extracted_data.uncertainty_reason && (
                      <div className="mt-2 text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-xl font-medium line-clamp-2">
                        &ldquo;{c.extracted_data.uncertainty_reason}&rdquo;
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Management Workspace */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Case ID: {selectedCase.id}</div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedCase.extracted_data.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-bold border border-slate-300">
                    Rule Version: {selectedCase.rule_version_id}
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-900 px-3 py-1 rounded-lg font-black">
                    Score: {(selectedCase.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="font-bold uppercase tracking-wider text-slate-500">
                    Document Extracted Data
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Name: {selectedCase.extracted_data.name}
                  </div>
                  <div className="font-mono text-slate-600">
                    CNIC: {selectedCase.extracted_data.cnic}
                  </div>
                  <div className="text-slate-600">
                    Declared Income: PKR {selectedCase.extracted_data.monthly_income?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-slate-600">
                    OCR Clarity: {selectedCase.extracted_data.ocr_quality ?? 0.88} / 1.00
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-2 text-xs">
                  <div className="font-bold uppercase tracking-wider text-indigo-800">
                    Mock NADRA DPI Baseline
                  </div>
                  <div className="text-sm font-bold text-indigo-950">
                    Record Match: {selectedCase.extracted_data.name_match_score ? 'Verified' : 'Found'}
                  </div>
                  <div className="text-indigo-900">
                    Name Match Index: {((selectedCase.extracted_data.name_match_score || 0.85) * 100).toFixed(0)}%
                  </div>
                  <div className="text-indigo-900">
                    District: {selectedCase.extracted_data.district || 'Karachi West'}
                  </div>
                  <div className="text-indigo-900">
                    Widow Status: {selectedCase.extracted_data.is_widow ? 'Yes (Verified)' : 'Standard'}
                  </div>
                </div>
              </div>

              {/* Uncertainty Reason Banner */}
              {selectedCase.extracted_data.uncertainty_reason && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>AI Uncertainty &amp; Cultural Transliteration Warning</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    {selectedCase.extracted_data.uncertainty_reason}
                  </p>
                </div>
              )}

              {/* Case Lifecycle Actions: Assign, Escalate, Close */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>Case Management Controls</span>
                  <span className="text-[10px] text-indigo-700">Assign &bull; Escalate &bull; Close</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Assign Section */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">1. Assign Case</span>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="usr-helper-1">Khadija Parveen (Helper)</option>
                      <option value="usr-officer-1">Officer Bilal Ahmed (Relief Desk)</option>
                    </select>
                    <button
                      onClick={handleAssignCase}
                      disabled={isSubmitting}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                      Assign Case
                    </button>
                  </div>

                  {/* Escalate Section */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">2. Escalate Case</span>
                    <input
                      type="text"
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleEscalateCase}
                      disabled={isSubmitting}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                      Escalate to Senior Desk
                    </button>
                  </div>
                </div>

                {/* Direct Officer Decision Buttons */}
                <div className="pt-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Mandatory Officer Audit Reason Note:
                    </label>
                    <textarea
                      rows={2}
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Enter verification notes (e.g. 'Reconciled physical CNIC transliteration with union council death certificate')..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleDecision('approved')}
                      disabled={isSubmitting}
                      className="touch-target-xl flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Grant</span>
                    </button>

                    <button
                      onClick={() => handleDecision('needs_more_proof')}
                      disabled={isSubmitting}
                      className="touch-target-xl flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Request Proof</span>
                    </button>

                    <button
                      onClick={() => handleDecision('rejected')}
                      disabled={isSubmitting}
                      className="touch-target-xl flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select a case from the queue on the left to begin case management review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
