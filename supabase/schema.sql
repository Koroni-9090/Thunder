-- ========================================================================
-- SahulatRail: AI on Public Rails (FAST-NUCES Karachi AI Hackathon)
-- Team Thunder | PostgreSQL / Supabase Migration Schema
-- "PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA & RAAST). NO REAL PERSONAL DATA."
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & DPI PARTICIPANTS
CREATE TYPE user_role AS ENUM ('citizen', 'helper', 'officer', 'admin', 'auditor');
CREATE TYPE language_preference AS ENUM ('ur', 'en');

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cnic_mock TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    language_pref language_preference NOT NULL DEFAULT 'ur',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_cnic ON users (cnic_mock);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 2. CONSENT LIFECYCLE (Data Sovereignty Engine)
CREATE TYPE consent_scope AS ENUM ('identity', 'financial', 'documents');

CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY DEFAULT ('cst-' || uuid_generate_v4()::text),
    citizen_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    granted_to_role user_role NOT NULL,
    scope consent_scope NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consents_lookup ON consents (citizen_id, granted_to_role, is_active);

-- 3. RULE VERSIONS (Immutable Policy Thresholds & Digital Twin)
CREATE TABLE IF NOT EXISTS rule_versions (
    id TEXT PRIMARY KEY,
    version_number INTEGER NOT NULL,
    min_poverty_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    max_monthly_income INTEGER NOT NULL DEFAULT 30000,
    required_docs JSONB NOT NULL DEFAULT '["CNIC", "Death Certificate of Husband"]'::jsonb,
    auto_approve_threshold NUMERIC(4,2) NOT NULL DEFAULT 0.85,
    human_handoff_threshold NUMERIC(4,2) NOT NULL DEFAULT 0.50,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rule_versions_unique_active ON rule_versions (is_active) WHERE is_active = TRUE;

-- 4. CASES & RELIEF CLAIMS
CREATE TYPE case_status AS ENUM (
    'draft',
    'auto_approved',
    'needs_more_proof',
    'human_review',
    'approved',
    'rejected',
    'closed'
);

CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    citizen_id TEXT NOT NULL REFERENCES users(id),
    citizen_name TEXT,
    cnic_mock TEXT NOT NULL,
    helper_id TEXT REFERENCES users(id),
    assigned_officer_id TEXT REFERENCES users(id),
    rule_version_id TEXT NOT NULL REFERENCES rule_versions(id),
    status case_status NOT NULL DEFAULT 'draft',
    confidence_score NUMERIC(4,2) NOT NULL,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    citizen_explanation_en TEXT NOT NULL,
    citizen_explanation_ur TEXT NOT NULL,
    auditor_trace JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_citizen ON cases (citizen_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_confidence ON cases (confidence_score ASC); -- For Lowest Confidence First Officer Queue

-- 5. IMMUTABLE AUDIT TRAIL LOGS
CREATE TYPE audit_action_type AS ENUM (
    'CASE_CREATED',
    'AI_DECISION',
    'CONSENT_GRANTED',
    'CONSENT_REVOKED',
    'DATA_CORRECTED',
    'RULE_UPDATED',
    'OFFICER_ASSIGNED',
    'OFFICER_OVERRIDE',
    'OFFICER_ESCALATED',
    'OFFICER_CLOSED',
    'SCAM_CHECK',
    'AGENT_EXECUTION',
    'RAAST_DISBURSED'
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT NOT NULL,
    action_type audit_action_type NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs (target_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);

-- 6. MOCK NADRA REGISTRY (With Messy Real-World Edge Cases)
CREATE TABLE IF NOT EXISTS mock_nadra_records (
    cnic_mock TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    father_or_husband_name TEXT NOT NULL,
    is_widow BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_income INTEGER NOT NULL,
    district TEXT NOT NULL,
    is_flagged_fraud BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. SCAM REPORTS & PHISHING SIGNALS
CREATE TABLE IF NOT EXISTS scam_reports (
    id TEXT PRIMARY KEY,
    raw_message TEXT NOT NULL,
    is_scam BOOLEAN NOT NULL,
    confidence NUMERIC(4,2) NOT NULL,
    scam_type TEXT,
    district TEXT,
    explanation_simple TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICATIONS & DISPATCHES
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    channel TEXT NOT NULL, -- sms, whatsapp, email, in_app
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    body_ur TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WEBHOOKS FOR PROVINCIAL & CENTRAL SYSTEMS
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_key TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
