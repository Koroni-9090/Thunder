'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ThunderLogo from '../../components/ThunderLogo';
import { useAuth } from '../../components/AuthContext';
import {
  Shield,
  Users,
  Wifi,
  WifiOff,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  Plus,
  Lock,
  LogIn,
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  cnic: string;
  district: string;
  isWidow: boolean;
  consentGranted: boolean;
  notes: string;
}

const VILLAGE_FAMILIES: FamilyMember[] = [
  {
    id: 'usr-citizen-1',
    name: 'Rashida Bibi',
    cnic: '35201-1234567-8',
    district: 'Lahore (Village 14-A)',
    isWidow: true,
    consentGranted: true,
    notes: 'Husband passed away in 2024. Illiterate. Has registered Raast wallet.',
  },
  {
    id: 'usr-citizen-2',
    name: 'Zubaida Begum',
    cnic: '42101-5555555-5',
    district: 'Karachi (Gadap Town)',
    isWidow: true,
    consentGranted: false, // EXPLICITLY REVOKED CONSENT FOR HELPER!
    notes: 'Citizen explicitly revoked Helper data access via Citizen Consent Center.',
  },
  {
    id: 'usr-citizen-3',
    name: 'Perveen Akhtar',
    cnic: '37405-3333333-3',
    district: 'Faisalabad',
    isWidow: true,
    consentGranted: true,
    notes: 'Requires biometric verification check.',
  },
];

export default function HelperPage() {
  const { isLoggedIn, isOnline, setIsOnline, speakText } = useAuth();
  const [selectedCitizen, setSelectedCitizen] = useState<FamilyMember>(VILLAGE_FAMILIES[0]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form fields for new application on behalf of citizen
  const [claimIncome, setClaimIncome] = useState('18000');
  const [claimNotes, setClaimNotes] = useState('Submitted via Community Helper Kiosk');

  // Load offline queue from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sahulat_offline_queue');
        if (stored) setOfflineQueue(JSON.parse(stored));
      } catch {
        // storage disabled or empty
      }
    }
  }, []);

  const saveQueueToStorage = (queue: any[]) => {
    setOfflineQueue(queue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahulat_offline_queue', JSON.stringify(queue));
    }
  };

  const handleQueueOrSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 1. Strict Consent Check: Cannot act for citizen if consent revoked
    if (!selectedCitizen.consentGranted) {
      setError(
        `403 FORBIDDEN: ${selectedCitizen.name} has revoked Helper Consent. Data access blocked by server-side policy.`
      );
      speakText(`Error: ${selectedCitizen.name} has revoked consent. You cannot submit an application on her behalf.`);
      return;
    }

    const applicationPayload = {
      deduplicationKey: `dedup-${selectedCitizen.id}-${selectedCitizen.cnic}`,
      citizenId: selectedCitizen.id,
      fullName: selectedCitizen.name,
      cnic: selectedCitizen.cnic,
      monthlyIncome: Number(claimIncome),
      isWidow: selectedCitizen.isWidow,
      district: selectedCitizen.district,
      notes: claimNotes,
      timestamp: new Date().toISOString(),
    };

    // If Offline: Save to local queue
    if (!isOnline) {
      const updatedQueue = [...offlineQueue, applicationPayload];
      saveQueueToStorage(updatedQueue);
      setMessage(`OFFLINE MODE: Application for ${selectedCitizen.name} saved to Local Queue (${updatedQueue.length} pending).`);
      speakText('Internet connection offline. Application saved to local memory.');
      return;
    }

    // If Online: Submit directly to API
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setMessage(`SUCCESS: Application for ${selectedCitizen.name} submitted! Status: ${data.case?.status || 'Received'}`);
      speakText(`Application successfully submitted. Status: ${data.case?.status}`);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    setError('');
    setMessage('');

    try {
      let syncedCount = 0;
      for (const item of offlineQueue) {
        const res = await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (res.ok) syncedCount++;
      }

      saveQueueToStorage([]);
      setMessage(`SYNC COMPLETE: ${syncedCount} applications synced to central registry with deduplication!`);
      speakText(`${syncedCount} offline applications have been synchronized.`);
    } catch (err: any) {
      setError('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-[#CBC6D3] border border-[#9E98A8] rounded-lg shadow-xl text-center space-y-4 text-[#1C1B1F]">
        <div className="w-14 h-14 rounded-full bg-[#859114] text-white flex items-center justify-center mx-auto shadow">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#1C1B1F]">Authentication Required</h2>
        <p className="text-xs text-[#46434D]">
          To protect community families and prevent unauthorized access, sign in before entering the Community Helper Hub.
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
      {/* Header */}
      <div className="bg-[#CBC6D3] rounded-lg p-6 sm:p-8 border border-[#9E98A8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#859114] text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Community Helper Kiosk Mode • 1 Phone for 40 Families</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1C1B1F]">
            Social Mobilizer Hub (Khadija Parveen)
          </h1>
          <p className="text-xs sm:text-sm text-[#46434D] mt-1 max-w-2xl">
            Assisting illiterate widows in remote villages with weak cellular coverage. Applications automatically queue offline and sync with deduplication keys when internet is restored.
          </p>
        </div>

        {/* Offline Queue Badge & Sync Action */}
        <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-md border border-[#9E98A8] shadow-sm">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`p-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
              isOnline ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-rose-100 text-rose-950 border border-rose-300 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-700" /> : <WifiOff className="w-3.5 h-3.5 text-rose-700" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </button>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOfflineQueue}
              disabled={syncing || !isOnline}
              className="bg-[#859114] hover:bg-[#6F7910] text-white font-bold px-3 py-2 rounded-md text-xs flex items-center gap-1.5 shadow disabled:opacity-40"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Sync {offlineQueue.length} Queued</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-100 border border-rose-300 text-rose-950 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rose-700 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Family Switcher vs Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 40 Families Switcher List */}
        <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#9E98A8] pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#859114]" />
              <h2 className="text-sm font-bold text-[#1C1B1F]">Registered Families</h2>
            </div>
            <span className="text-xs bg-white text-[#1C1B1F] font-bold px-2 py-0.5 rounded border border-[#9E98A8] font-mono">
              3 of 40 Shown
            </span>
          </div>

          <div className="space-y-2">
            {VILLAGE_FAMILIES.map((family) => {
              const isSelected = selectedCitizen.id === family.id;
              return (
                <div
                  key={family.id}
                  onClick={() => setSelectedCitizen(family)}
                  className={`p-3 rounded-md border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'border-[#859114] bg-white shadow-sm'
                      : 'border-[#9E98A8] hover:border-[#859114] bg-[#D5D1DC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#1C1B1F]">{family.name}</div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        family.consentGranted
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}
                    >
                      {family.consentGranted ? 'Consent Active' : 'Consent Revoked'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#46434D] font-mono mt-0.5">{family.cnic}</div>
                  <div className="text-[11px] text-[#46434D] mt-0.5">{family.district}</div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#9E98A8] text-[11px] text-[#46434D]">
            Note: Selecting a citizen with &ldquo;Consent Revoked&rdquo; will be blocked by backend enforcement.
          </div>
        </div>

        {/* Right 2 Columns: Application Submission & Offline Queue Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-[#9E98A8] pb-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-[#1C1B1F]">
                  Assist Citizen: {selectedCitizen.name}
                </h3>
                <p className="text-xs text-[#46434D]">
                  CNIC: {selectedCitizen.cnic} • {selectedCitizen.district}
                </p>
              </div>

              {!selectedCitizen.consentGranted && (
                <div className="flex items-center gap-1.5 bg-rose-100 border border-rose-300 text-rose-950 text-xs px-2.5 py-1 rounded-md font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                  <span>Access Blocked by Citizen</span>
                </div>
              )}
            </div>

            {!selectedCitizen.consentGranted ? (
              <div className="bg-white border border-[#9E98A8] p-6 rounded-md text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
                <h4 className="text-sm font-bold text-[#1C1B1F]">403 Forbidden: Consent Withdrawn</h4>
                <p className="text-xs text-[#46434D] max-w-md mx-auto">
                  {selectedCitizen.name} has toggled OFF Helper consent in her privacy settings. You cannot view her sensitive documents or submit claims on her behalf until she re-grants consent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQueueOrSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Reported Monthly Household Income (PKR)
                    </label>
                    <input
                      type="number"
                      value={claimIncome}
                      onChange={(e) => setClaimIncome(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Vulnerability Status
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedCitizen.isWidow ? 'Widow (Special Relief Priority)' : 'Standard'}
                      className="w-full px-3 py-2 bg-[#D5D1DC] border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                    Community Helper Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#9E98A8] rounded-md text-xs text-[#1C1B1F] focus:outline-none focus:border-[#859114]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-[#46434D]">
                    Dispatch Mode:{' '}
                    <span className="font-bold text-[#1C1B1F]">
                      {isOnline ? 'Instant API Dispatch' : 'Local Queue (Offline)'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#859114] hover:bg-[#6F7910] text-white font-bold py-2.5 px-5 rounded-md text-xs flex items-center gap-2 transition shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isOnline ? 'Submit Relief Application' : 'Save to Offline Queue'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Offline Queue Items Viewer */}
          <div className="bg-[#CBC6D3] rounded-lg border border-[#9E98A8] shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-[#9E98A8] pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#859114]" />
                <h3 className="text-sm font-bold text-[#1C1B1F]">
                  Local Offline Storage Queue ({offlineQueue.length} Pending)
                </h3>
              </div>
              {offlineQueue.length > 0 && (
                <button
                  onClick={() => saveQueueToStorage([])}
                  className="text-xs text-[#46434D] hover:text-rose-700"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {offlineQueue.length === 0 ? (
              <p className="text-xs text-[#46434D] italic py-3 text-center">
                Offline queue is empty. When internet is unavailable, applications are queued here with deduplication keys.
              </p>
            ) : (
              <div className="space-y-2">
                {offlineQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#9E98A8] p-2.5 rounded-md text-xs flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-[#1C1B1F]">{item.fullName}</div>
                      <div className="text-[11px] text-[#46434D] font-mono">
                        {item.cnic} • Dedup: {item.deduplicationKey}
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#859114]/20 text-[#859114] font-mono px-2 py-0.5 rounded font-bold">
                      QUEUED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
