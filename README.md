# ⚡ SahulatRail: AI on Public Rails
### Developed by Team Thunder — Coder's Cup '26 AI Hackathon (FAST-NUCES Karachi)

> **CRITICAL COMPLIANCE NOTICE:**  
> **PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA & RAAST). NO REAL PERSONAL DATA.**

---

## 🎯 The Core Problem & Our Mission
A low-literacy widow in rural Pakistan needs emergency relief funding. She cannot read dense official forms, has intermittent 2G cellular connectivity, her physical CNIC has slight spelling variations (e.g. *“Mohammad”* vs *“Muhammad”*), and government eligibility rules change frequently. Furthermore, she is constantly targeted by predatory fake *“8171 Relief”* SMS scams asking for advance fees and Raast PINs.

**SahulatRail by Team Thunder** bridges this digital divide through an AI-powered Digital Public Infrastructure (DPI) layer that delivers voice-first accessibility, asymmetric risk routing, transparent citizen consent governance, and offline resilience.

---

## ⚖️ The Asymmetric Risk Router
> **“Wrong approvals cost more than slow approvals.”**

Traditional automated approval systems optimize for speed and false negatives, risking catastrophic leakage of public relief funds. SahulatRail inverts this paradigm:

$$\text{Composite Confidence} = 0.4 \cdot S_{\text{Jaro-Winkler}} + 0.3 \cdot C_{\text{OCR}} + 0.3 \cdot V_{\text{Widow}}$$

- **Asymmetric Safeguard:** If any transliteration or spelling mismatch is detected ($S_{\text{Jaro-Winkler}} < 0.95$ or raw string divergence), the composite confidence is **hard-capped to $0.58$ ($58\%$)**.
- **Auto-Approve Threshold ($\ge 85\%$):** Funds are disbursed instantly via simulated SBP Raast switch only when zero fraud flags and unambiguous identity matches are confirmed.
- **Human Handoff Floor ($50\% - 84\%$):** Cases with spelling ambiguity or missing proof are safely routed to Welfare Officer Tariq Mehmood's **Lowest Confidence First** review queue with explicit reasoning: *“AI Confidence Low: Uncertain name/document match. Escalated to Human Officer.”*
- **Fraud Quarantine ($< 50\%$ or Registry Hold):** Applications flagged in the NADRA registry or exhibiting digital document tampering are halted with zero disbursement risk.

---

## 👥 5 Stakeholder Workspaces

| Workspace | Persona | Route | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Citizen** | Rashida Bibi (Widow) | `/citizen` | Voice-first bilingual interface (Urdu/English), simulated camera scan, fake 8171 SMS scam checker, and full Consent Lifecycle UI. |
| **Community Helper** | Khadija Parveen (Mobilizer) | `/helper` | 1 phone serving 40 families kiosk, isolated per-citizen consent check (blocked if consent revoked), and offline queue sync with deduplication keys. |
| **Welfare Officer** | Tariq Mehmood (Desk Officer) | `/officer` | Priority review queue sorted by **Lowest Confidence First**, side-by-side doc & AI JSON diff, and Assign/Escalate/Close/Override actions. |
| **Policy Admin** | Zainab Abbas (Policy Director) | `/admin` | Live parameter editor (no code redeploys) + **Digital Twin Simulator** replaying prospective thresholds against past cases. |
| **State Auditor** | Farooq Ahmed (Auditor General) | `/auditor` | Read-only compliance dashboard with immutable SHA-256 audit logs, consent revocation history, and AI evaluation metrics (Accuracy, FPR, Latency). |

---

## 🛠️ Technological Innovations

### 1. Voice-First Bilingual Audio UX (Young Man Voice)
- Configured Web Speech API synthesis with `pitch = 1.22` and `rate = 1.05`, selecting crisp male voices to sound energetic and alert.
- Bilingual STT (Urdu `ur-PK` and English `en-US`) enabling illiterate citizens to speak their claims and SMS messages directly.

### 2. Dual Explainability
- **For Citizens:** 2 simple, plain-language sentences in Urdu and English explaining why a decision was reached.
- **For Auditors:** Complete cryptographic trace containing model version, input hash, Jaro-Winkler score, OCR clarity metric, and rule version ID.

### 3. PWA Offline-First Architecture
- Service Worker (`public/sw.js`) and Web Manifest (`public/manifest.json`) enabling community helpers to work without an active internet connection.
- Local storage offline queue with unique deduplication keys (`dedup-key-${citizenId}-${Date.now()}`) that syncs automatically upon reconnection.

### 4. Autonomous DPI Agent (`/api/agents/run`)
- Executes the Plan & Execute agent workflow calling 4 deterministic tools:
  1. `verify_identity` (NADRA Verisys)
  2. `evaluate_rules` (Asymmetric Risk Router)
  3. `disburse_raast` (SBP ISO-20022 Raast Switch)
  4. `send_notification` (Multi-channel SMS/WhatsApp 8171 alert)

### 5. Public REST API & Swagger Documentation (`/docs`)
- OpenAPI 3.0 specification served at `/api/docs`.
- API Key management (`x-api-key`) with SHA-256 hashing and sliding window rate limiting (120 reqs/min).

---

## 🧪 Automated Security & Integration Test Suite

Run the 26-test verification suite covering RBAC, consent revocation (403), asymmetric risk, and scam detection:

```bash
npx tsx tests/api-security.test.ts
```

Output:
```
===============================================================
⚡ SAHULATRAIL (TEAM THUNDER) HACKATHON VERIFICATION TEST SUITE
===============================================================
...
===============================================================
TEST RESULTS: 26 PASSED | 0 FAILED
===============================================================
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations (Supabase / PostgreSQL)
```bash
psql -f supabase/schema.sql
psql -f supabase/seed.sql
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Real vs. Simulated Breakdown

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **Asymmetric Risk Engine** | **REAL** | Active Jaro-Winkler fuzzy logic and asymmetric confidence capping in `/lib/ai-engine.ts`. |
| **RBAC & Consent Enforcement**| **REAL** | Server-side guards returning HTTP 401/403 on API routes in `/lib/auth.ts`. |
| **Rate Limiter** | **REAL** | In-memory sliding window rate limiter (120 req/min) in `/lib/auth.ts`. |
| **API Key Authentication** | **REAL** | SHA-256 validation for `x-api-key` in `/lib/api-keys.ts`. |
| **Voice STT/TTS** | **REAL** | Native Web Speech API integration in `/components/AuthContext.tsx`. |
| **NADRA Verisys & SBP Raast** | **SIMULATED** | Clean mock REST endpoints behind `/api/mock/nadra` and `/api/mock/raast`. |

---
**Team Thunder** — *Built for Coder's Cup '26 AI Hackathon (FAST-NUCES Karachi)*.
