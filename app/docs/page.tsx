'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  Key,
  ExternalLink,
  Terminal,
  Play,
  PlusCircle,
  Trash2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ApiKeyRecord } from '@/lib/api-keys';

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [issuedKeyAlert, setIssuedKeyAlert] = useState<string | null>(null);
  const [isIssuingKey, setIsIssuingKey] = useState(false);

  // Live tester state
  const [testEndpoint, setTestEndpoint] = useState('/api/mock/nadra?cnic=42101-1234567-8');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys', {
        headers: { 'x-sahulat-user-id': 'usr-admin-1' },
      });
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch (e) {
      console.error('Failed to load keys', e);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleIssueKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsIssuingKey(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sahulat-user-id': 'usr-admin-1' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setIssuedKeyAlert(`NEW KEY GENERATED: ${data.apiKey.fullKey} (Save this key now!)`);
        setNewKeyName('');
        await fetchKeys();
      }
    } catch (e) {
      console.error('Issue key error', e);
    } finally {
      setIsIssuingKey(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleRunLiveTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(testEndpoint, {
        headers: {
          'x-api-key': 'sahulat_live_key_dpi2026',
        },
      });
      const data = await res.json();
      setTestResponse({ status: res.status, data });
    } catch (e: any) {
      setTestResponse({ error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/mock/nadra?cnic=42101-1234567-8',
      tag: 'Mock Identity Service',
      description: 'Queries mock NADRA DPI registry for citizen identity records, widow indicators, and fraud watch status.',
      curl: `curl -X GET "http://localhost:3000/api/mock/nadra?cnic=42101-1234567-8" \\
  -H "x-api-key: sahulat_live_key_dpi2026"`,
    },
    {
      method: 'POST',
      path: '/api/ocr',
      tag: 'Computer Vision & OCR',
      description: 'Uploads CNIC scan, runs OCR field extraction, and analyzes image compression for tampering/forgery.',
      curl: `curl -X POST http://localhost:3000/api/ocr \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sahulat_live_key_dpi2026" \\
  -d '{"rawText": "PAKISTAN CNIC - Zubaida Bibi - 42101-1234567-8"}'`,
    },
    {
      method: 'POST',
      path: '/api/agents/run',
      tag: 'Autonomous Agent',
      description: 'Executes autonomous relief claim agent with sequential tool calling (verify, evaluate, disburse, notify).',
      curl: `curl -X POST http://localhost:3000/api/agents/run \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sahulat_live_key_dpi2026" \\
  -d '{"cnic": "42101-1234567-8"}'`,
    },
    {
      method: 'POST',
      path: '/api/cases',
      tag: 'Cases',
      description: 'Submits relief claim. Evaluated by Asymmetric Risk Router. Low confidence (<85%) triggers safe human handoff.',
      curl: `curl -X POST http://localhost:3000/api/cases \\
  -H "Content-Type: application/json" \\
  -H "x-sahulat-user-id: usr-widow-1" \\
  -d '{"manualCnic": "42101-1234567-8", "manualName": "Zubaida Bibi", "manualIncome": 18000}'`,
    },
    {
      method: 'POST',
      path: '/api/cases/{id}/escalate',
      tag: 'Case Management',
      description: 'Escalates ambiguous case to senior supervisor queue with attached uncertainty notes.',
      curl: `curl -X POST http://localhost:3000/api/cases/case-102/escalate \\
  -H "Content-Type: application/json" \\
  -H "x-sahulat-user-id: usr-officer-1" \\
  -d '{"escalationReason": "Mohammad Ali vs Muhammad Ali Khan transliteration variance"}'`,
    },
    {
      method: 'POST',
      path: '/api/consents',
      tag: 'Consent Take-Back',
      description: 'Withdraws helper or officer consent. Revocation immediately enforces HTTP 403 Forbidden on backend.',
      curl: `curl -X POST http://localhost:3000/api/consents \\
  -H "Content-Type: application/json" \\
  -H "x-sahulat-user-id: usr-shopkeeper-2" \\
  -d '{"citizenId": "usr-shopkeeper-2", "grantedToRole": "helper", "scope": "identity", "isActive": false}'`,
    },
    {
      method: 'GET',
      path: '/api/health',
      tag: 'Monitoring',
      description: 'Returns real-time health checks, database latency, and service worker status.',
      curl: `curl -X GET http://localhost:3000/api/health`,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Developer Platform &bull; OpenAPI 3.0 &amp; Swagger Spec</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">
            SahulatRail REST API Documentation
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Complete API reference with API Key issuing, rate limits, and interactive tester by Team Thunder.
          </p>
        </div>

        <Link
          href="/api/docs"
          target="_blank"
          className="flex items-center gap-2 bg-[#1E1B4B] hover:bg-indigo-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
        >
          <Code2 className="w-4 h-4" />
          <span>Raw OpenAPI JSON (/api/docs)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* API Key Issuing & Management Section */}
      <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            <h2 className="font-black text-sm sm:text-base text-slate-900">
              API Key Management &amp; Issuing
            </h2>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded">
            Header: x-api-key
          </span>
        </div>

        {issuedKeyAlert && (
          <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold text-xs">
            {issuedKeyAlert}
          </div>
        )}

        <form onSubmit={handleIssueKey} className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Enter key name (e.g. Sindh Disaster Relief Integration)"
            className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-indigo-600"
            required
          />
          <button
            type="submit"
            disabled={isIssuingKey}
            className="px-4 py-2 bg-[#1E1B4B] text-amber-400 font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-900 transition"
          >
            Issue New API Key
          </button>
        </form>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Registered Keys:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {keys.map((k) => (
              <div key={k.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{k.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{k.keyPrefix} ({k.rateLimitPerMinute} req/min)</div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive API Live Tester */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Interactive Live API Workbench</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">x-api-key: sahulat_live_key_dpi2026</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="flex-1 h-10 px-3.5 rounded-xl bg-slate-800 text-emerald-400 font-mono text-xs border border-slate-700"
          />
          <button
            onClick={handleRunLiveTest}
            disabled={isTesting}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition"
          >
            {isTesting ? 'Testing...' : 'Send Request'}
          </button>
        </div>

        {testResponse && (
          <pre className="p-3 bg-black/60 rounded-xl text-emerald-400 font-mono text-[11px] max-h-48 overflow-y-auto">
            {JSON.stringify(testResponse, null, 2)}
          </pre>
        )}
      </div>

      {/* Endpoints Reference */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Endpoints Reference</h2>

        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-indigo-600 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-black font-mono ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">{ep.path}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                {ep.tag}
              </span>
            </div>

            <p className="text-xs text-slate-600">{ep.description}</p>

            <div className="relative rounded-xl bg-slate-950 p-3 text-slate-200 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard(ep.curl, idx)}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-slate-800 text-slate-200 px-2 py-1 rounded text-[10px] font-sans font-semibold"
              >
                {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy cURL'}</span>
              </button>
              <pre className="text-emerald-400">{ep.curl}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
