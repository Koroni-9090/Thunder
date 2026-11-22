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
  const [testEndpoint, setTestEndpoint] = useState('/api/mock/nadra?cnic=35201-1234567-8');
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
      if (data.key) {
        setIssuedKeyAlert(`API Key issued! Copy now: ${data.key.fullKey}`);
        setNewKeyName('');
        await fetchKeys();
      }
    } catch (e) {
      console.error('Issue key failed', e);
    } finally {
      setIsIssuingKey(false);
    }
  };

  const handleRunLiveTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(testEndpoint, {
        headers: {
          'x-api-key': 'sahulat_live_key_dpi2026',
        },
      });
      const data = await res.json();
      setTestResponse({ status: res.status, ok: res.ok, data });
    } catch (e: any) {
      setTestResponse({ error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/docs',
      description: 'Returns the full OpenAPI 3.0 specification in JSON format.',
      curl: 'curl -X GET "http://localhost:3000/api/docs"',
      tag: 'Documentation',
    },
    {
      method: 'GET',
      path: '/api/mock/nadra?cnic={cnic}',
      description: 'Queries mock NADRA Verisys registry with messy Pakistani edge cases.',
      curl: 'curl -X GET "http://localhost:3000/api/mock/nadra?cnic=35201-1234567-8" \\\n  -H "x-api-key: sahulat_live_key_dpi2026"',
      tag: 'Identity DPI',
    },
    {
      method: 'POST',
      path: '/api/cases',
      description: 'Submits relief claim through the Asymmetric Risk Router.',
      curl: 'curl -X POST "http://localhost:3000/api/cases" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: sahulat_live_key_dpi2026" \\\n  -d \'{"cnic":"35201-1234567-8","fullName":"Rashida Bibi","monthlyIncome":18000}\'',
      tag: 'Relief Claims',
    },
    {
      method: 'POST',
      path: '/api/scams/check',
      description: 'Evaluates suspicious SMS alerts against 8171 short-code registry.',
      curl: 'curl -X POST "http://localhost:3000/api/scams/check" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"message":"8171: 25000 grant call 0300"}\'',
      tag: 'Scam Shield',
    },
    {
      method: 'POST',
      path: '/api/mock/raast',
      description: 'Executes simulated instant payment via SBP ISO-20022 Raast switch.',
      curl: 'curl -X POST "http://localhost:3000/api/mock/raast" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"cnic":"35201-1234567-8","amount":10500}\'',
      tag: 'Payment DPI',
    },
    {
      method: 'POST',
      path: '/api/agents/run',
      description: 'Invokes autonomous DPI Agent with 4 sequential tool calling steps.',
      curl: 'curl -X POST "http://localhost:3000/api/agents/run" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"cnic":"35201-1234567-8"}\'',
      tag: 'Autonomous Agent',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#383737] rounded-lg p-6 sm:p-8 border border-[#616060] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Developer Portal &bull; REST API &bull; OpenAPI 3.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFFFFF]">
            SahulatRail Public REST API
          </h1>
          <p className="text-xs sm:text-sm text-[#D1D5DB] mt-0.5 max-w-2xl">
            Integrate provincial emergency response systems, BISP portals, and financial switches with standard Bearer JWT or API Key authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/api/docs"
            target="_blank"
            className="flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white px-3.5 py-2 rounded-md font-bold text-xs shadow transition"
          >
            <Code2 className="w-4 h-4" />
            <span>OpenAPI JSON</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-[#383737] rounded-lg p-6 border border-[#616060] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#616060] pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-base font-bold text-[#FFFFFF]">API Key Management</h2>
          </div>
          <span className="text-[10px] bg-white text-[#F59E0B] font-bold px-2 py-0.5 rounded border border-[#616060]">
            Header: x-api-key
          </span>
        </div>

        {issuedKeyAlert && (
          <div className="p-3 bg-white border border-[#F59E0B] text-[#FFFFFF] font-bold text-xs rounded-md shadow-sm">
            {issuedKeyAlert}
          </div>
        )}

        <form onSubmit={handleIssueKey} className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Enter key name (e.g. Sindh Disaster Relief Integration)"
            className="flex-1 h-9 px-3 bg-white rounded-md border border-[#616060] text-xs font-medium text-[#FFFFFF] focus:outline-none focus:border-[#F59E0B]"
            required
          />
          <button
            type="submit"
            disabled={isIssuingKey}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs rounded-md shadow transition"
          >
            Issue New API Key
          </button>
        </form>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D1D5DB]">
            Active Registered Keys:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-md border border-[#616060] bg-white flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="font-bold text-[#FFFFFF]">{k.name}</div>
                  <div className="text-[11px] font-mono text-[#D1D5DB]">
                    {k.keyPrefix} ({k.rateLimitPerMinute} req/min)
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive API Live Tester */}
      <div className="bg-[#FFFFFF] text-white rounded-lg p-6 shadow-xl space-y-4 border border-[#616060]">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-bold text-sm text-white">Interactive Live API Workbench</h3>
          </div>
          <span className="text-xs text-white/70 font-mono">x-api-key: sahulat_live_key_dpi2026</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="flex-1 h-9 px-3 rounded-md bg-black/50 text-white font-mono text-xs border border-white/30 focus:outline-none focus:border-[#F59E0B]"
          />
          <button
            onClick={handleRunLiveTest}
            disabled={isTesting}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs rounded-md shadow transition"
          >
            {isTesting ? 'Testing...' : 'Send Request'}
          </button>
        </div>

        {testResponse && (
          <pre className="p-3 bg-black/80 rounded-md text-emerald-400 font-mono text-[11px] max-h-48 overflow-y-auto border border-white/10">
            {JSON.stringify(testResponse, null, 2)}
          </pre>
        )}
      </div>

      {/* Endpoints Reference */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#FFFFFF]">Endpoints Reference</h2>

        {endpoints.map((ep, idx) => (
          <div
            key={idx}
            className="bg-[#383737] rounded-lg border border-[#616060] p-5 space-y-3 shadow-sm hover:border-[#F59E0B] transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-950 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-[#FFFFFF]">
                  {ep.path}
                </span>
              </div>
              <span className="text-[10px] bg-[#242323] text-white font-bold px-2 py-0.5 rounded border border-[#616060]">
                {ep.tag}
              </span>
            </div>

            <p className="text-xs text-[#D1D5DB]">{ep.description}</p>

            <div className="relative rounded-md bg-[#FFFFFF] p-3 text-white font-mono text-xs overflow-x-auto border border-[#616060]">
              <button
                onClick={() => copyToClipboard(ep.curl, idx)}
                className="absolute top-2 right-2 flex items-center gap-1 bg-[#F59E0B] hover:bg-[#D97706] text-white px-2 py-1 rounded text-[10px] font-sans font-bold shadow"
              >
                {copiedIndex === idx ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
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
