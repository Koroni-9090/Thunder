'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Sparkles,
  Lock,
  Unlock,
  Play,
  Pause,
  Camera,
  Edit3,
  Send,
  Zap,
} from 'lucide-react';
import { CaseRecord, Consent } from '@/lib/types';

export default function CitizenPage() {
  const { user, language, speak, isSpeaking, stopSpeaking } = useAuth();

  const [activeTab, setActiveTab] = useState<'claim' | 'scam' | 'consent'>('claim');

  // Claim Form State
  const [selectedPreset, setSelectedPreset] = useState<'widow' | 'variant' | 'fraud'>('widow');
  const [cnicInput, setCnicInput] = useState('42101-1234567-8');
  const [nameInput, setNameInput] = useState('Zubaida Bibi');
  const [incomeInput, setIncomeInput] = useState('18000');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [recentCase, setRecentCase] = useState<CaseRecord | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  // OCR Upload State
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);

  // Scam Checker State
  const [smsText, setSmsText] = useState(
    'Mubarak ho! BISP Ehsaas program ki taraf se apko 25,000 rupay mil chukay hain. Foran is number 0301-2345678 par call karke apna JazzCash account verify karain warna raqam wapis chali jaye gi.'
  );
  const [isAnalyzingSms, setIsAnalyzingSms] = useState(false);
  const [scamResult, setScamResult] = useState<any>(null);
  const [isListeningSms, setIsListeningSms] = useState(false);

  // Consent Management State
  const [consents, setConsents] = useState<Consent[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [consentAlert, setConsentAlert] = useState<string | null>(null);

  // Data Correction State (Consent Right to Rectify)
  const [correctionName, setCorrectionName] = useState('Zubaida Bibi');
  const [correctionCnic, setCorrectionCnic] = useState('42101-1234567-8');
  const [correctionReason, setCorrectionReason] = useState('Phonetic spelling rectification');
  const [isCorrecting, setIsCorrecting] = useState(false);

  const fetchConsents = async () => {
    if (!user) return;
    setIsLoadingConsents(true);
    try {
      const res = await fetch(`/api/consents?citizenId=${user.id}`);
      const data = await res.json();
      if (data.consents) setConsents(data.consents);
      if (data.citizenData) {
        setCorrectionName(data.citizenData.name);
        setCorrectionCnic(data.citizenData.cnic);
      }
    } catch (e) {
      console.error('Failed to load consents', e);
    } finally {
      setIsLoadingConsents(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [user]);

  const handlePresetSelect = (preset: 'widow' | 'variant' | 'fraud') => {
    setSelectedPreset(preset);
    if (preset === 'widow') {
      setCnicInput('42101-1234567-8');
      setNameInput('Zubaida Bibi');
      setIncomeInput('18000');
    } else if (preset === 'variant') {
      setCnicInput('35202-4455667-3');
      setNameInput('Mohammad Ali');
      setIncomeInput('25000');
    } else if (preset === 'fraud') {
      setCnicInput('42501-0000000-0');
      setNameInput('Fake Recordholder');
      setIncomeInput('0');
    }
  };

  // Simulated OCR camera/document scan
  const handleSimulatedScan = async () => {
    setIsProcessingOcr(true);
    setOcrStatus('Scanning document with computer vision & tamper heuristics...');
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: `PAKISTAN CNIC - ${nameInput} - ${cnicInput} - S/O or W/O Ghulam Rasool`,
          fileName: 'mock_cnic_scan.jpg',
        }),
      });
      const data = await res.json();
      if (data.ocrResult) {
        setNameInput(data.ocrResult.fullName);
        setCnicInput(data.ocrResult.cnic);
        setOcrStatus(`OCR Extracted! Confidence: ${(data.ocrResult.ocrConfidence * 100).toFixed(0)}%. Tamper Risk: ${(data.ocrResult.tamperRiskScore * 100).toFixed(0)}%`);
        speak(`Document scanned successfully. Identity verified for ${data.ocrResult.fullName}`, language);
      }
    } catch (e) {
      console.error('OCR scan failed', e);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!user) return;
    setIsSubmittingClaim(true);
    setClaimError(null);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user.id,
          manualCnic: cnicInput,
          manualName: nameInput,
          manualIncome: Number(incomeInput),
          rawText: `CNIC: ${cnicInput}, Name: ${nameInput}, Monthly Income: ${incomeInput}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.message || 'Submission failed');
      } else {
        setRecentCase(data.case);
        const explanation = language === 'ur' ? data.case.citizen_explanation_ur : data.case.citizen_explanation_en;
        speak(explanation, language);
      }
    } catch (e: any) {
      setClaimError(e.message || 'Network error');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleCheckScam = async () => {
    if (!smsText.trim()) return;
    setIsAnalyzingSms(true);
    try {
      const res = await fetch('/api/scams/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: smsText, district: 'Karachi' }),
      });
      const data = await res.json();
      if (data.success) {
        setScamResult(data.analysis);
        const explanation = language === 'ur' ? data.analysis.explanationSimpleUr : data.analysis.explanationSimpleEn;
        speak(explanation, language);
      }
    } catch (e) {
      console.error('Failed to analyze SMS', e);
    } finally {
      setIsAnalyzingSms(false);
    }
  };

  const handleToggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    if (isListeningSms) {
      setIsListeningSms(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningSms(true);
      recognition.onend = () => setIsListeningSms(false);
      recognition.onerror = () => setIsListeningSms(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSmsText(transcript);
        setIsListeningSms(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error', err);
      setIsListeningSms(false);
    }
  };

  const handleToggleConsent = async (
    grantedToRole: 'officer' | 'helper' | 'admin' | 'auditor',
    scope: 'identity' | 'financial' | 'documents',
    currentActive: boolean
  ) => {
    if (!user) return;
    const newActive = !currentActive;

    try {
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user.id,
          grantedToRole,
          scope,
          isActive: newActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConsents((prev) =>
          prev.map((c) =>
            c.granted_to_role === grantedToRole && c.scope === scope ? { ...c, is_active: newActive } : c
          )
        );
        const msg = newActive
          ? `Consent GRANTED to ${grantedToRole.toUpperCase()} for ${scope}. Access opened on backend.`
          : `CONSENT REVOKED: ${grantedToRole.toUpperCase()} blocked on backend API for ${scope}! Audit log recorded.`;
        setConsentAlert(msg);
        setTimeout(() => setConsentAlert(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle consent', err);
    }
  };

  const handleCorrectData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsCorrecting(true);

    try {
      const res = await fetch('/api/consents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: user.id,
          correctedName: correctionName,
          correctedCnic: correctionCnic,
          correctionReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNameInput(correctionName);
        setCnicInput(correctionCnic);
        setConsentAlert('Identity data rectified and logged to immutable audit ledger.');
        setTimeout(() => setConsentAlert(null), 5000);
      }
    } catch (e) {
      console.error('Rectification error', e);
    } finally {
      setIsCorrecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Matching Screenshot */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>CITIZEN PORTAL &mdash; LOW-LITERACY &amp; VOICE-FIRST</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#1E1B4B]">
            {language === 'ur' ? `خوش آمدید، ${user?.name || 'شہری'}` : `Welcome, ${user?.name || 'Citizen'}`}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Apply for Emergency Relief, verify identity, and check suspicious SMS messages.
          </p>
        </div>

        {/* Global Guide Button */}
        <button
          onClick={() => {
            const intro =
              language === 'ur'
                ? 'خوش آمدید۔ سہولت ریل پر آپ اپنے شناختی کارڈ کی مدد سے ہنگامی ریلیف حاصل کر سکتے ہیں اور جعلی پیغامات کی جانچ کر سکتے ہیں۔'
                : 'Welcome to SahulatRail. You can claim emergency relief and verify suspicious SMS messages.';
            if (isSpeaking) stopSpeaking();
            else speak(intro, language);
          }}
          className="touch-target-xl flex items-center gap-2.5 bg-white hover:bg-slate-50 text-[#1E1B4B] font-extrabold px-5 py-3 rounded-2xl border-2 border-indigo-200 shadow-md transition self-stretch sm:self-auto justify-center"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-5 h-5 text-red-500 animate-pulse" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-indigo-600" />
              <span>Listen Guide</span>
            </>
          )}
        </button>
      </div>

      {/* 3 Main Tabs Pills */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('claim')}
          className={`touch-target-xl p-4 rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2 border-2 transition ${
            activeTab === 'claim'
              ? 'bg-[#1E1B4B] text-amber-400 border-[#1E1B4B] shadow-lg'
              : 'bg-white text-slate-700 border-purple-200/80 hover:border-indigo-600'
          }`}
        >
          <FileCheck className="w-5 h-5 flex-shrink-0" />
          <span>1. Relief Claim</span>
        </button>

        <button
          onClick={() => setActiveTab('scam')}
          className={`touch-target-xl p-4 rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2 border-2 transition ${
            activeTab === 'scam'
              ? 'bg-[#1E1B4B] text-amber-400 border-[#1E1B4B] shadow-lg'
              : 'bg-white text-slate-700 border-purple-200/80 hover:border-amber-600'
          }`}
        >
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>2. Scam SMS Check</span>
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`touch-target-xl p-4 rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2 border-2 transition ${
            activeTab === 'consent'
              ? 'bg-[#1E1B4B] text-amber-400 border-[#1E1B4B] shadow-lg'
              : 'bg-white text-slate-700 border-purple-200/80 hover:border-purple-600'
          }`}
        >
          <Lock className="w-5 h-5 flex-shrink-0" />
          <span>3. My Consents</span>
        </button>
      </div>

      {/* TAB 1: RELIEF CLAIM */}
      {activeTab === 'claim' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Apply for Emergency Relief Grant */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">
                  Apply for Emergency Relief Grant
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Select a realistic scenario or scan your document using AI Computer Vision.
                </p>
              </div>

              {/* Preset Scenarios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('widow')}
                  className={`p-3 rounded-2xl border-2 text-left transition ${
                    selectedPreset === 'widow'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-black text-emerald-700">Scenario A</div>
                  <div className="font-extrabold text-xs sm:text-sm">Zubaida Bibi (Widow)</div>
                  <div className="text-[10px] text-slate-500">Auto-Approve &ge; 85%</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('variant')}
                  className={`p-3 rounded-2xl border-2 text-left transition ${
                    selectedPreset === 'variant'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-black text-blue-700">Scenario B</div>
                  <div className="font-extrabold text-xs sm:text-sm">Mohammad Ali (Variant)</div>
                  <div className="text-[10px] text-slate-500">&ldquo;I Am Not Sure&rdquo; Handoff</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('fraud')}
                  className={`p-3 rounded-2xl border-2 text-left transition ${
                    selectedPreset === 'fraud'
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-black text-rose-700">Scenario C</div>
                  <div className="font-extrabold text-xs sm:text-sm">Fraud Syndicate Watch</div>
                  <div className="text-[10px] text-slate-500">Auto-Quarantine Block</div>
                </button>
              </div>

              {/* Upload Documents & AI Matcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 1. Upload Documents */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="font-black text-xs uppercase tracking-wider text-indigo-900 self-start">
                    1. Upload Documents
                  </span>

                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Camera className="w-7 h-7" />
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleSimulatedScan}
                      disabled={isProcessingOcr}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-indigo-300 font-bold text-xs text-indigo-950 shadow-xs transition"
                    >
                      {isProcessingOcr ? 'Scanning with OCR...' : 'Upload CNIC or Document'}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className="p-2.5 rounded-xl bg-[#1E1B4B] text-amber-400 hover:bg-indigo-900 shadow-xs"
                      title="Speak document info"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  {ocrStatus && (
                    <div className="text-[11px] font-bold text-indigo-900 bg-white p-2 rounded-xl border border-indigo-200 w-full">
                      {ocrStatus}
                    </div>
                  )}
                </div>

                {/* 2. AI Matcher */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <span className="font-black text-xs uppercase tracking-wider text-slate-700 block">
                    2. AI Matcher
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Full Name:</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">CNIC Number:</label>
                    <input
                      type="text"
                      value={cnicInput}
                      onChange={(e) => setCnicInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Monthly Income (PKR):</label>
                    <input
                      type="number"
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Claim Action */}
              <button
                onClick={handleClaimSubmit}
                disabled={isSubmittingClaim}
                className="touch-target-xl w-full flex items-center justify-center gap-2 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-black text-base py-4 px-6 rounded-2xl shadow-xl transition disabled:opacity-60"
              >
                {isSubmittingClaim ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Evaluating Asymmetric Risk Router...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Evaluate Relief Claim with AI</span>
                  </>
                )}
              </button>

              {claimError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>{claimError}</span>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Assistant & Audio Readout Panel Matching Screenshot */}
            <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-amber-50/30 rounded-3xl p-6 border border-purple-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-base font-black text-[#1E1B4B] mb-2">
                  Assistant &amp; Audio Readout
                </h3>

                {/* Media Audio Player Controls Matching Screenshot */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <button
                    onClick={() => {
                      const text = recentCase
                        ? language === 'ur'
                          ? recentCase.citizen_explanation_ur
                          : recentCase.citizen_explanation_en
                        : 'Welcome to SahulatRail. You can claim emergency relief grants and verify SMS alerts.';
                      speak(text, language);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md hover:bg-indigo-950 transition"
                    title="Play voice readout"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>

                  <button
                    onClick={stopSpeaking}
                    className="w-12 h-12 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center shadow-lg hover:bg-indigo-900 transition"
                    title="Pause voice"
                  >
                    <Pause className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleToggleMic}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
                      isListeningSms ? 'bg-red-600 text-white animate-ping' : 'bg-slate-900 text-amber-400'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-purple-100 text-xs leading-relaxed text-slate-700 shadow-xs space-y-2">
                  <p className="font-semibold">
                    Energetic Young Male Voice Enabled (pitch 1.22). Designed for low-literacy clarity and bilingual Urdu/English speech.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Large touch targets and audio guidance support seamless completion even on 2G/3G connections.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-400/20 border border-amber-400/50 rounded-2xl text-[11px] text-amber-950 font-bold">
                ⚡ Team Thunder DPI Engine &bull; Zero Silent Guessing
              </div>
            </div>
          </div>

          {/* Decision Result Banner */}
          {recentCase && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-400">Case ID: {recentCase.id}</span>
                  <h3 className="text-xl font-black text-slate-900">AI Risk Evaluation Decision</h3>
                </div>

                <div className="flex items-center gap-3">
                  {recentCase.status === 'auto_approved' && (
                    <div className="flex items-center gap-2 bg-emerald-100 border-2 border-emerald-600 text-emerald-950 px-4 py-2 rounded-2xl font-black text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>AUTO-APPROVED</span>
                    </div>
                  )}

                  {recentCase.status === 'human_review' && (
                    <div className="flex items-center gap-2 bg-blue-100 border-2 border-blue-600 text-blue-950 px-4 py-2 rounded-2xl font-black text-sm">
                      <HelpCircle className="w-5 h-5 text-blue-600 animate-pulse" />
                      <span>HUMAN HANDOFF</span>
                    </div>
                  )}

                  {recentCase.status === 'needs_more_proof' && (
                    <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-600 text-amber-950 px-4 py-2 rounded-2xl font-black text-sm">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span>NEEDS MORE PROOF</span>
                    </div>
                  )}

                  {recentCase.status === 'rejected' && (
                    <div className="flex items-center gap-2 bg-rose-100 border-2 border-rose-600 text-rose-950 px-4 py-2 rounded-2xl font-black text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <span>REJECTED</span>
                    </div>
                  )}

                  <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800">
                    Confidence: {(recentCase.confidence_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* 2-Sentence Plain Explanation */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Plain-Language Citizen Explanation
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {language === 'ur' ? recentCase.citizen_explanation_ur : recentCase.citizen_explanation_en}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const t = language === 'ur' ? recentCase.citizen_explanation_ur : recentCase.citizen_explanation_en;
                    if (isSpeaking) stopSpeaking();
                    else speak(t, language);
                  }}
                  className="touch-target-xl flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#1E1B4B] text-amber-400 shadow-md hover:bg-indigo-900 transition"
                  title="Listen in young man voice"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCAM SMS CHECKER */}
      {activeTab === 'scam' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1E1B4B]">
              Verify Suspicious &ldquo;BISP / Raast&rdquo; SMS
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Paste received SMS to evaluate against official DPI short-code registries (8171).
            </p>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste SMS text here or tap mic to speak..."
              className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleToggleMic}
              className={`absolute bottom-3 right-3 touch-target-xl flex items-center justify-center w-11 h-11 rounded-full shadow-md transition ${
                isListeningSms ? 'bg-red-600 text-white animate-ping' : 'bg-[#1E1B4B] text-amber-400'
              }`}
              title="Tap to speak SMS"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleCheckScam}
            disabled={isAnalyzingSms}
            className="touch-target-xl w-full flex items-center justify-center gap-2 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg transition disabled:opacity-60"
          >
            {isAnalyzingSms ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Scanning Scam Signatures...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>Verify Message Safety</span>
              </>
            )}
          </button>

          {scamResult && (
            <div
              className={`p-6 rounded-3xl border-2 space-y-3 ${
                scamResult.isScam ? 'bg-rose-50 border-rose-500 text-rose-950' : 'bg-emerald-50 border-emerald-500 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-lg">
                  {scamResult.isScam ? <ShieldAlert className="w-6 h-6 text-rose-600" /> : <ShieldCheck className="w-6 h-6 text-emerald-600" />}
                  <span>{scamResult.isScam ? 'DANGER: FRAUD DETECTED' : 'SAFE: OFFICIAL NOTIFICATION'}</span>
                </div>
                <button
                  onClick={() => {
                    const text = language === 'ur' ? scamResult.explanationSimpleUr : scamResult.explanationSimpleEn;
                    speak(text, language);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1E1B4B] text-amber-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Warning</span>
                </button>
              </div>

              <p className="font-bold text-xs sm:text-sm leading-relaxed">
                {language === 'ur' ? scamResult.explanationSimpleUr : scamResult.explanationSimpleEn}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONSENT LIFECYCLE (SEE, SHARE, WITHDRAW, CORRECT) */}
      {activeTab === 'consent' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1E1B4B]">
              Consent Management &amp; Data Rectification
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Full consent lifecycle under DPI Data Sovereignty: See permissions, Share, Withdraw (403 block), and Correct inaccuracies.
            </p>
          </div>

          {consentAlert && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-xs sm:text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <span>{consentAlert}</span>
            </div>
          )}

          {/* Permission Toggles */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Active Role Permissions
            </h3>

            {/* Helper Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-black text-sm text-slate-900 block">Community Helper Access</span>
                <span className="text-xs text-slate-500">Allows Social Mobilizer Khadija to submit relief claims on your behalf.</span>
              </div>
              <button
                onClick={() => {
                  const h = consents.find((c) => c.granted_to_role === 'helper');
                  handleToggleConsent('helper', 'identity', h ? h.is_active : false);
                }}
                className={`touch-target-xl px-5 py-2 rounded-xl text-xs font-black transition ${
                  consents.find((c) => c.granted_to_role === 'helper')?.is_active
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {consents.find((c) => c.granted_to_role === 'helper')?.is_active ? 'ACCESS ACTIVE (ON)' : 'REVOKED (403 BLOCK)'}
              </button>
            </div>

            {/* Officer Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-black text-sm text-slate-900 block">Department Officer Review Access</span>
                <span className="text-xs text-slate-500">Allows Desk Officer Bilal to review uploaded document data.</span>
              </div>
              <button
                onClick={() => {
                  const o = consents.find((c) => c.granted_to_role === 'officer');
                  handleToggleConsent('officer', 'identity', o ? o.is_active : false);
                }}
                className={`touch-target-xl px-5 py-2 rounded-xl text-xs font-black transition ${
                  consents.find((c) => c.granted_to_role === 'officer')?.is_active
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {consents.find((c) => c.granted_to_role === 'officer')?.is_active ? 'ACCESS ACTIVE (ON)' : 'REVOKED (403 BLOCK)'}
              </button>
            </div>
          </div>

          {/* Correct Citizen Data Form */}
          <form onSubmit={handleCorrectData} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                Rectify &amp; Correct Identity Data (Citizen Rights)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Rectified Name Spelling:</label>
                <input
                  type="text"
                  value={correctionName}
                  onChange={(e) => setCorrectionName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Corrected Mock CNIC:</label>
                <input
                  type="text"
                  value={correctionCnic}
                  onChange={(e) => setCorrectionCnic(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCorrecting}
              className="touch-target-xl px-5 py-2.5 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-black rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {isCorrecting ? 'Rectifying Record...' : 'Save Rectified Record & Update Audit Log'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
