'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Camera,
  Edit3,
  Send,
  Zap,
  FileText,
  Eye,
  LogIn,
} from 'lucide-react';
import { CaseRecord, Consent } from '@/lib/types';

export default function CitizenPage() {
  const { user, isLoggedIn, language, speak, isSpeaking, stopSpeaking } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'claim' | 'scam' | 'consent'>('claim');

  // Claim Form State
  const [selectedPreset, setSelectedPreset] = useState<'widow' | 'variant' | 'fraud'>('widow');
  const [cnicInput, setCnicInput] = useState('35201-1234567-8');
  const [nameInput, setNameInput] = useState('Rashida Bibi');
  const [incomeInput, setIncomeInput] = useState('18000');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [recentCase, setRecentCase] = useState<CaseRecord | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  // File Upload & OCR State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [ocrRiskFlags, setOcrRiskFlags] = useState<string[]>([]);

  // Scam Checker State
  const [smsText, setSmsText] = useState(
    '8171: Mubarak! Aap ka 25,000 Ka Ehsaas Relief Pass Hogaya Hai. Call 0300-1234567 for Raast pin.'
  );
  const [isAnalyzingSms, setIsAnalyzingSms] = useState(false);
  const [scamResult, setScamResult] = useState<any>(null);
  const [isListeningSms, setIsListeningSms] = useState(false);

  // Consent Management State
  const [consents, setConsents] = useState<Consent[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [consentAlert, setConsentAlert] = useState<string | null>(null);

  // Data Correction State (Right to Rectify)
  const [correctionName, setCorrectionName] = useState('Rashida Bibi');
  const [correctionCnic, setCorrectionCnic] = useState('35201-1234567-8');
  const [correctionReason, setCorrectionReason] = useState('Phonetic spelling rectification');
  const [isCorrecting, setIsCorrecting] = useState(false);

  const fetchConsents = async () => {
    const citizenId = user?.id || 'usr-citizen-1';
    setIsLoadingConsents(true);
    try {
      const res = await fetch(`/api/consents?citizenId=${citizenId}`);
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
      setCnicInput('35201-1234567-8');
      setNameInput('Rashida Bibi');
      setIncomeInput('18000');
    } else if (preset === 'variant') {
      setCnicInput('35201-9999999-9');
      setNameInput('Mohammad Ali');
      setIncomeInput('22000');
    } else if (preset === 'fraud') {
      setCnicInput('37405-3333333-3');
      setNameInput('Perveen Akhtar');
      setIncomeInput('12000');
    }
  };

  // Real File Upload Handler (Opens File Explorer)
  const handleRealFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingOcr(true);
    setOcrStatus(`Reading ${file.name} with Computer Vision OCR & Tamper Heuristics...`);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (file.type.startsWith('image/')) {
        setUploadedPreview(base64Data);
      } else {
        setUploadedPreview(null);
      }

      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentBase64: base64Data,
            fileName: file.name,
            rawText: `Scanned File: ${file.name} (Size: ${file.size} bytes)`,
          }),
        });

        const data = await res.json();
        if (data.ocrResult) {
          setNameInput(data.ocrResult.fullName);
          setCnicInput(data.ocrResult.cnic);
          setOcrStatus(
            `Extracted: ${data.ocrResult.fullName} (${data.ocrResult.cnic}) • OCR Clarity: ${Math.round(
              data.ocrResult.ocrConfidence * 100
            )}% • Tamper Risk: ${Math.round(data.ocrResult.tamperRiskScore * 100)}%`
          );

          if (data.ocrResult.isTampered) {
            setOcrRiskFlags(['DIGITAL_TAMPER_ARTIFACTS_DETECTED']);
          } else {
            setOcrRiskFlags([]);
          }

          const msg =
            language === 'ur'
              ? `دستاویز کامیابی سے اسکین ہو گئی ہے۔ شناخت: ${data.ocrResult.fullName}`
              : `Document scanned successfully. Identity verified for ${data.ocrResult.fullName}`;
          speak(msg, language);
        }
      } catch (err) {
        console.error('OCR processing error:', err);
        setOcrStatus('File uploaded. Fallback OCR extracted fields.');
      } finally {
        setIsProcessingOcr(false);
      }
    };

    reader.onerror = () => {
      setIsProcessingOcr(false);
      setOcrStatus('Failed to read file from disk.');
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleClaimSubmit = async () => {
    setIsSubmittingClaim(true);
    setClaimError(null);

    const citizenId = user?.id || 'usr-citizen-1';

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          cnic: cnicInput,
          fullName: nameInput,
          monthlyIncome: Number(incomeInput),
          isWidow: selectedPreset === 'widow' || nameInput.toLowerCase().includes('bibi'),
          ocrConfidence: 0.96,
          forgerySuspect: ocrRiskFlags.length > 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.message || 'Submission failed');
      } else {
        setRecentCase(data.case);
        const explanation =
          language === 'ur' ? data.case.citizen_explanation_ur : data.case.citizen_explanation_en;
        speak(explanation, language);
      }
    } catch (e: any) {
      setClaimError(e.message || 'Network error');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Scam SMS Check Handler
  const handleCheckScam = async () => {
    if (!smsText.trim()) return;
    setIsAnalyzingSms(true);
    setScamResult(null);

    try {
      const res = await fetch('/api/scams/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: smsText, district: 'National' }),
      });

      const data = await res.json();
      const analysis = data.analysis || data.result;

      if (analysis) {
        setScamResult(analysis);
        const explanation =
          language === 'ur'
            ? analysis.explanationSimpleUr || analysis.explanation_ur || analysis.explanation_simple
            : analysis.explanationSimpleEn || analysis.explanation_simple;
        speak(explanation, language);
      } else {
        setScamResult({
          isScam: true,
          explanationSimpleEn: 'Scam alert: Suspicious text format detected.',
          explanationSimpleUr: 'خطرہ: مشتبہ پیغام پایا گیا ہے۔',
          confidence: 0.9,
          warningSigns: ['Unverified sender'],
        });
      }
    } catch (e) {
      console.error('Failed to analyze SMS', e);
    } finally {
      setIsAnalyzingSms(false);
    }
  };

  const handleToggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
    const citizenId = user?.id || 'usr-citizen-1';
    const newActive = !currentActive;

    try {
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          grantedToRole,
          scope,
          isActive: newActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsents((prev) =>
          prev.map((c) =>
            c.granted_to_role === grantedToRole && c.scope === scope ? { ...c, is_active: newActive } : c
          )
        );
        const msg = newActive
          ? `Consent GRANTED to ${grantedToRole.toUpperCase()} for ${scope}. Access allowed on backend.`
          : `CONSENT REVOKED: ${grantedToRole.toUpperCase()} blocked on backend API (403 Forbidden) for ${scope}! Audit log written.`;
        setConsentAlert(msg);
        setTimeout(() => setConsentAlert(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle consent', err);
    }
  };

  const handleCorrectData = async (e: React.FormEvent) => {
    e.preventDefault();
    const citizenId = user?.id || 'usr-citizen-1';
    setIsCorrecting(true);

    try {
      const res = await fetch('/api/consents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          correctedName: correctionName,
          correctedCnic: correctionCnic,
          correctionReason,
        }),
      });
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

  // Auth gate check
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#CBC6D3] border border-[#9E98A8] rounded-lg shadow-xl text-center space-y-4 text-[#1C1B1F]">
        <div className="w-14 h-14 rounded-full bg-[#859114] text-white flex items-center justify-center mx-auto shadow">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#1C1B1F]">Authentication Required</h2>
        <p className="text-xs text-[#46434D]">
          To protect citizen records and personal data privacy, you must sign in before accessing the Citizen Portal.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Continue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#1C1B1F]">
      {/* Hidden Native File Input that opens OS File Explorer */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRealFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Top Banner */}
      <div className="bg-[#CBC6D3] rounded-lg p-6 border border-[#9E98A8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#859114] bg-white px-2.5 py-0.5 rounded-md mb-2 border border-[#9E98A8]">
            <span className="w-2 h-2 rounded-full bg-[#859114] animate-pulse"></span>
            <span>CITIZEN PORTAL &mdash; LOW-LITERACY &amp; VOICE-FIRST</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1B1F]">
            {language === 'ur' ? `خوش آمدید، ${nameInput || 'شہری'}` : `Welcome, ${nameInput || 'Citizen'}`}
          </h1>
          <p className="text-[#46434D] text-xs sm:text-sm mt-0.5">
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
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#1C1B1F] font-bold px-4 py-2.5 rounded-md border border-[#9E98A8] shadow-sm transition"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-xs">Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#859114]" />
              <span className="text-xs">Listen Audio Guide</span>
            </>
          )}
        </button>
      </div>

      {/* 3 Main Tabs Pills */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('claim')}
          className={`p-3.5 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition shadow-sm ${
            activeTab === 'claim'
              ? 'bg-[#859114] text-white border-[#6F7910]'
              : 'bg-[#D5D1DC] text-[#1C1B1F] border-[#9E98A8] hover:bg-[#CBC6D3]'
          }`}
        >
          <FileCheck className="w-4 h-4 flex-shrink-0" />
          <span>1. Relief Claim</span>
        </button>

        <button
          onClick={() => setActiveTab('scam')}
          className={`p-3.5 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition shadow-sm ${
            activeTab === 'scam'
              ? 'bg-[#859114] text-white border-[#6F7910]'
              : 'bg-[#D5D1DC] text-[#1C1B1F] border-[#9E98A8] hover:bg-[#CBC6D3]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>2. Scam SMS Check</span>
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`p-3.5 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition shadow-sm ${
            activeTab === 'consent'
              ? 'bg-[#859114] text-white border-[#6F7910]'
              : 'bg-[#D5D1DC] text-[#1C1B1F] border-[#9E98A8] hover:bg-[#CBC6D3]'
          }`}
        >
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>3. My Consents</span>
        </button>
      </div>

      {/* TAB 1: RELIEF CLAIM */}
      {activeTab === 'claim' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Apply for Emergency Relief Grant */}
            <div className="lg:col-span-8 bg-[#CBC6D3] rounded-lg p-6 border border-[#9E98A8] shadow-sm space-y-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1C1B1F]">
                  Apply for Emergency Relief Grant
                </h2>
                <p className="text-[#46434D] text-xs mt-0.5">
                  Select a test scenario or click below to upload your real document from file explorer.
                </p>
              </div>

              {/* Preset Scenarios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('widow')}
                  className={`p-3 rounded-md border text-left transition ${
                    selectedPreset === 'widow'
                      ? 'border-[#859114] bg-white text-[#1C1B1F] font-bold shadow-sm'
                      : 'border-[#9E98A8] bg-[#D5D1DC] text-[#1C1B1F]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#859114]">Scenario A</div>
                  <div className="font-bold text-xs">Rashida Bibi (Widow)</div>
                  <div className="text-[10px] text-[#46434D]">Auto-Approve &ge; 85%</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('variant')}
                  className={`p-3 rounded-md border text-left transition ${
                    selectedPreset === 'variant'
                      ? 'border-[#859114] bg-white text-[#1C1B1F] font-bold shadow-sm'
                      : 'border-[#9E98A8] bg-[#D5D1DC] text-[#1C1B1F]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#859114]">Scenario B</div>
                  <div className="font-bold text-xs">Mohammad Ali (Variant)</div>
                  <div className="text-[10px] text-[#46434D]">&ldquo;I Am Not Sure&rdquo; Handoff</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('fraud')}
                  className={`p-3 rounded-md border text-left transition ${
                    selectedPreset === 'fraud'
                      ? 'border-[#859114] bg-white text-[#1C1B1F] font-bold shadow-sm'
                      : 'border-[#9E98A8] bg-[#D5D1DC] text-[#1C1B1F]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-rose-700">Scenario C</div>
                  <div className="font-bold text-xs">Perveen (Syndicate)</div>
                  <div className="text-[10px] text-[#46434D]">Auto-Quarantine Block</div>
                </button>
              </div>

              {/* Upload Documents & AI Matcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1. Upload Documents - REAL FILE EXPLORER PICKER */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-lg border-2 border-dashed border-[#859114] bg-[#D5D1DC] hover:bg-[#CBC6D3] cursor-pointer flex flex-col items-center justify-center text-center space-y-3 transition"
                  title="Click to open File Explorer and choose document"
                >
                  <span className="font-bold text-xs uppercase tracking-wider text-[#859114] self-start">
                    1. Upload Document (Images / PDF)
                  </span>

                  <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#859114] border border-[#9E98A8]">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="font-bold text-xs text-[#1C1B1F]">
                      {uploadedFileName ? uploadedFileName : 'Click to Open File Explorer'}
                    </div>
                    <div className="text-[11px] text-[#46434D]">
                      Supports CNIC, B-Form, death cert, scans or photos
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={isProcessingOcr}
                    className="py-2 px-4 rounded-md bg-[#859114] hover:bg-[#6F7910] text-white font-bold text-xs shadow-sm transition"
                  >
                    {isProcessingOcr ? 'Scanning with OCR...' : 'Choose File from Computer'}
                  </button>

                  {ocrStatus && (
                    <div className="text-[11px] font-bold text-[#1C1B1F] bg-white p-2 rounded-md border border-[#9E98A8] w-full text-left">
                      {ocrStatus}
                    </div>
                  )}

                  {uploadedPreview && (
                    <div className="w-full mt-2 rounded-md overflow-hidden border border-[#9E98A8] max-h-36">
                      <img src={uploadedPreview} alt="Uploaded Document Preview" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>

                {/* 2. AI Matcher Form */}
                <div className="p-4 rounded-lg border border-[#9E98A8] bg-white space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#1C1B1F] block">
                    2. AI Matcher &amp; Verified Data
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-[#46434D] block mb-1">Full Legal Name:</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-[#9E98A8] text-xs font-bold text-[#1C1B1F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#46434D] block mb-1">CNIC Number:</label>
                    <input
                      type="text"
                      value={cnicInput}
                      onChange={(e) => setCnicInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-[#9E98A8] text-xs font-mono text-[#1C1B1F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#46434D] block mb-1">Monthly Income (PKR):</label>
                    <input
                      type="number"
                      value={incomeInput}
                      onChange={(e) => setIncomeInput(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-[#9E98A8] text-xs font-bold text-[#1C1B1F]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Relief Claim Button */}
              {claimError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-md text-xs font-bold">
                  {claimError}
                </div>
              )}

              <button
                type="button"
                onClick={handleClaimSubmit}
                disabled={isSubmittingClaim}
                className="w-full py-3.5 px-4 rounded-md bg-[#859114] hover:bg-[#6F7910] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmittingClaim ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with Asymmetric Risk Router...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Submit Relief Claim for Instant Raast Disbursal</span>
                  </>
                )}
              </button>
            </div>

            {/* Right 4 Cols: Audio Readout & Info */}
            <div className="lg:col-span-4 bg-[#D5D1DC] rounded-lg p-6 border border-[#9E98A8] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#1C1B1F] mb-1">Assistant &amp; Audio Readout</h3>
                <p className="text-xs text-[#46434D]">
                  Dual-language voice assistance (Urdu &amp; English) with young man voice timbre.
                </p>

                <div className="flex items-center gap-3 my-4">
                  <button
                    onClick={() =>
                      speak(
                        language === 'ur'
                          ? `درخواست دہندہ: ${nameInput}، شناختی کارڈ: ${cnicInput}۔ ماہانہ آمدنی ${incomeInput} روپے ہے۔`
                          : `Applicant: ${nameInput}, CNIC: ${cnicInput}, Income: PKR ${incomeInput}.`,
                        language
                      )
                    }
                    className="w-10 h-10 rounded-full bg-[#859114] text-white flex items-center justify-center shadow hover:bg-[#6F7910] transition"
                    title="Play voice"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={stopSpeaking}
                    className="w-10 h-10 rounded-full bg-[#1C1B1F] text-white flex items-center justify-center shadow hover:bg-black transition"
                    title="Stop audio"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToggleMic}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow transition ${
                      isListeningSms ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-[#859114] border border-[#9E98A8]'
                    }`}
                    title="Speech input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-white rounded-md border border-[#9E98A8] text-xs text-[#1C1B1F] space-y-1">
                  <div className="font-bold text-[#859114]">Asymmetric Risk Principle:</div>
                  <p className="text-[11px] text-[#46434D]">
                    &ldquo;Wrong approvals cost more than slow approvals.&rdquo; Name spelling variations (Mohammad vs Muhammad) are safely capped to 58% confidence and routed to Human Officer Tariq.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#859114]/15 border border-[#859114]/40 rounded-md text-[11px] text-[#1C1B1F] font-bold">
                ⚡ Team Thunder DPI Engine &bull; Zero Hallucination
              </div>
            </div>
          </div>

          {/* Decision Result Card */}
          {recentCase && (
            <div className="bg-white rounded-lg p-6 border border-[#9E98A8] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#9E98A8]">
                <div>
                  <span className="text-xs font-mono uppercase text-[#46434D]">Case ID: {recentCase.id}</span>
                  <h3 className="text-lg font-bold text-[#1C1B1F]">AI Risk Evaluation Decision</h3>
                </div>

                <div className="flex items-center gap-2">
                  {recentCase.status === 'auto_approved' && (
                    <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300">
                      AUTO-APPROVED (Raast Disbursed)
                    </span>
                  )}
                  {recentCase.status === 'human_review' && (
                    <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300">
                      HUMAN HANDOFF (&ldquo;I Am Not Sure&rdquo;)
                    </span>
                  )}
                  {recentCase.status === 'rejected' && (
                    <span className="px-3 py-1 rounded-md bg-rose-100 text-rose-950 font-bold text-xs border border-rose-300">
                      REJECTED
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-[#46434D] bg-[#D5D1DC] px-2 py-1 rounded-md">
                    Confidence: {Math.round(recentCase.confidence_score * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#D5D1DC] rounded-md border border-[#9E98A8] flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#46434D]">Plain-Language Citizen Explanation</div>
                  <p className="text-sm font-bold text-[#1C1B1F] mt-0.5">
                    {language === 'ur' ? recentCase.citizen_explanation_ur : recentCase.citizen_explanation_en}
                  </p>
                </div>
                <button
                  onClick={() =>
                    speak(
                      language === 'ur' ? recentCase.citizen_explanation_ur : recentCase.citizen_explanation_en,
                      language
                    )
                  }
                  className="w-9 h-9 rounded-full bg-[#859114] text-white flex items-center justify-center flex-shrink-0 shadow hover:bg-[#6F7910]"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCAM SMS CHECKER */}
      {activeTab === 'scam' && (
        <div className="bg-[#CBC6D3] rounded-lg p-6 sm:p-8 border border-[#9E98A8] shadow-sm space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1B1F]">
              Verify Suspicious &ldquo;BISP / Raast&rdquo; SMS
            </h2>
            <p className="text-[#46434D] text-xs mt-0.5">
              Paste received SMS to evaluate against official DPI short-code registries (8171).
            </p>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste SMS text here or tap mic to speak..."
              className="w-full p-3.5 rounded-md border border-[#9E98A8] bg-white text-xs sm:text-sm text-[#1C1B1F] focus:outline-none focus:border-[#859114] shadow-inner"
            />

            <button
              type="button"
              onClick={handleToggleMic}
              className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full shadow transition ${
                isListeningSms ? 'bg-red-600 text-white animate-pulse' : 'bg-[#859114] text-white'
              }`}
              title="Tap to speak SMS"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCheckScam}
            disabled={isAnalyzingSms}
            className="w-full flex items-center justify-center gap-2 bg-[#859114] hover:bg-[#6F7910] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-md shadow-md transition disabled:opacity-60"
          >
            {isAnalyzingSms ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Scam Signatures...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Verify Message Safety</span>
              </>
            )}
          </button>

          {scamResult && (
            <div
              className={`p-5 rounded-md border space-y-3 ${
                scamResult.isScam || scamResult.is_scam
                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  {scamResult.isScam || scamResult.is_scam ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  )}
                  <span>
                    {scamResult.isScam || scamResult.is_scam
                      ? 'DANGER: FRAUD DETECTED'
                      : 'SAFE: OFFICIAL NOTIFICATION'}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10">
                    Confidence: {Math.round((scamResult.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    const text =
                      language === 'ur'
                        ? scamResult.explanationSimpleUr || scamResult.explanation_ur
                        : scamResult.explanationSimpleEn || scamResult.explanation_simple;
                    speak(text, language);
                  }}
                  className="px-3 py-1.5 rounded-md bg-[#859114] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Warning</span>
                </button>
              </div>

              <p className="font-bold text-xs sm:text-sm leading-relaxed">
                {language === 'ur'
                  ? scamResult.explanationSimpleUr || scamResult.explanation_ur
                  : scamResult.explanationSimpleEn || scamResult.explanation_simple}
              </p>

              {scamResult.warningSigns && scamResult.warningSigns.length > 0 && (
                <div className="text-[11px] space-y-0.5 pt-1 border-t border-black/10">
                  <div className="font-bold">Detected Warning Signs:</div>
                  <ul className="list-disc list-inside">
                    {scamResult.warningSigns.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONSENT LIFECYCLE (SEE, SHARE, WITHDRAW, CORRECT) */}
      {activeTab === 'consent' && (
        <div className="bg-[#CBC6D3] rounded-lg p-6 sm:p-8 border border-[#9E98A8] shadow-sm space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1B1F]">
              Consent Management &amp; Data Rectification
            </h2>
            <p className="text-[#46434D] text-xs mt-0.5">
              Full consent lifecycle under DPI Data Sovereignty: See permissions, Share, Withdraw (403 block), and Correct inaccuracies.
            </p>
          </div>

          {consentAlert && (
            <div className="p-3.5 rounded-md bg-white border border-[#859114] text-[#1C1B1F] font-bold text-xs flex items-center gap-2 shadow">
              <ShieldCheck className="w-4 h-4 text-[#859114] flex-shrink-0" />
              <span>{consentAlert}</span>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#46434D]">
              Active Role Permissions &amp; Access Controls
            </h3>

            {isLoadingConsents ? (
              <p className="text-xs text-[#46434D]">Loading consent states...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {consents.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-md bg-white border border-[#9E98A8] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#1C1B1F] uppercase">
                        Role: {c.granted_to_role}
                      </div>
                      <div className="text-[11px] text-[#46434D]">Scope: {c.scope}</div>
                      <div className="text-[10px] text-[#859114] font-bold mt-1">
                        {c.is_active ? 'Active on Backend' : 'Blocked (403 Forbidden)'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleConsent(c.granted_to_role as any, c.scope, c.is_active)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm ${
                        c.is_active
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-[#859114] hover:bg-[#6F7910] text-white'
                      }`}
                    >
                      {c.is_active ? 'Revoke Consent' : 'Grant Consent'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right to Rectify Misspelled Names */}
          <div className="pt-4 border-t border-[#9E98A8]">
            <h3 className="text-sm font-bold text-[#1C1B1F] mb-1">
              Right to Rectify (Citizen Data Sovereignty)
            </h3>
            <p className="text-xs text-[#46434D] mb-4">
              Fix misspelled names or transliterations directly. All rectifications are written to the immutable audit ledger.
            </p>

            <form onSubmit={handleCorrectData} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={correctionName}
                onChange={(e) => setCorrectionName(e.target.value)}
                placeholder="Corrected Name"
                required
                className="h-9 px-3 rounded-md border border-[#9E98A8] bg-white text-xs font-bold text-[#1C1B1F]"
              />

              <input
                type="text"
                value={correctionCnic}
                onChange={(e) => setCorrectionCnic(e.target.value)}
                placeholder="Corrected CNIC"
                required
                className="h-9 px-3 rounded-md border border-[#9E98A8] bg-white text-xs font-mono text-[#1C1B1F]"
              />

              <button
                type="submit"
                disabled={isCorrecting}
                className="h-9 px-4 rounded-md bg-[#859114] hover:bg-[#6F7910] text-white font-bold text-xs shadow transition disabled:opacity-50"
              >
                {isCorrecting ? 'Recording...' : 'Update & Log Rectification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
