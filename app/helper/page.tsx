'use client';

import React, { useState, useEffect } from 'react';
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
  const { isOnline, setIsOnline, speakText } = useAuth();
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Community Helper Kiosk Mode • 1 Phone for 40 Families</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Social Mobilizer Hub (Khadija Parveen)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Assisting illiterate widows in remote villages with weak cellular coverage. Applications automatically queue offline and sync with deduplication keys when internet is restored.
          </p>
        </div>

        {/* Offline Queue Badge & Sync Action */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Network Online' : 'Network Offline'}</span>
          </button>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOfflineQueue}
              disabled={syncing || !isOnline}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Sync {offlineQueue.length} Queued</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid: Family Switcher vs Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: 40 Families Switcher List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Registered Families</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">
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
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{family.name}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        family.consentGranted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {family.consentGranted ? 'Consent Active' : 'Consent Revoked'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{family.cnic}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{family.district}</div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Note: Selecting a citizen with &ldquo;Consent Revoked&rdquo; will be blocked by backend enforcement.
          </div>
        </div>

        {/* Right 2 Columns: Application Submission & Offline Queue Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assist Citizen: {selectedCitizen.name}
                </h3>
                <p className="text-xs text-slate-500">
                  CNIC: {selectedCitizen.cnic} • {selectedCitizen.district}
                </p>
              </div>

              {!selectedCitizen.consentGranted && (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-1.5 rounded-xl font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Access Blocked by Citizen</span>
                </div>
              )}
            </div>

            {!selectedCitizen.consentGranted ? (
              <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
                <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
                <h4 className="text-sm font-bold text-rose-900">403 Forbidden: Consent Withdrawn</h4>
                <p className="text-xs text-rose-700 max-w-md mx-auto">
                  {selectedCitizen.name} has toggled OFF Helper consent in her privacy settings. You cannot view her sensitive documents or submit claims on her behalf until she re-grants consent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQueueOrSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reported Monthly Household Income (PKR)
                    </label>
                    <input
                      type="number"
                      value={claimIncome}
                      onChange={(e) => setClaimIncome(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Marital &amp; Vulnerability Status
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedCitizen.isWidow ? 'Widow (Special Relief Priority)' : 'Standard'}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Community Helper Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Mode:{' '}
                    <span className="font-bold text-slate-800">
                      {isOnline ? 'Instant API Dispatch' : 'Local Queue (Offline)'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>
                      {isOnline ? 'Submit Relief Application' : 'Save to Offline Queue'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Offline Queue Items Viewer */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Local Offline Storage Queue ({offlineQueue.length} Pending)
                </h3>
              </div>
              {offlineQueue.length > 0 && (
                <button
                  onClick={() => saveQueueToStorage([])}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {offlineQueue.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Offline queue is empty. When internet is unavailable, applications are queued here with deduplication keys.
              </p>
            ) : (
              <div className="space-y-2">
                {offlineQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.cnic} • Dedup: {item.deduplicationKey}
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded-full font-bold">
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
