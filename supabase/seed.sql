-- ========================================================================
-- SahulatRail: Seed Data Script (FAST-NUCES Karachi AI Hackathon)
-- Team Thunder | Realistic Pakistani Edge Cases (Urdu & English)
-- "PROTOTYPE ONLY — SIMULATED DPI SERVICES (MOCK NADRA & RAAST). NO REAL PERSONAL DATA."
-- ========================================================================

-- 1. USERS SEED
INSERT INTO users (id, name, email, cnic_mock, role, language_pref, created_at)
VALUES
    ('usr-citizen-1', 'Rashida Bibi', 'rashida.widow@example.com', '35201-1234567-8', 'citizen', 'ur', '2026-01-10T10:00:00Z'),
    ('usr-citizen-2', 'Zubaida Begum', 'zubaida.begum@example.com', '42101-5555555-5', 'citizen', 'ur', '2026-01-15T10:00:00Z'),
    ('usr-citizen-3', 'Perveen Akhtar', 'perveen.akhtar@example.com', '37405-3333333-3', 'citizen', 'ur', '2026-02-01T10:00:00Z'),
    ('usr-helper-1', 'Khadija Parveen (Social Mobilizer)', 'khadija.helper@example.com', '35201-9876543-2', 'helper', 'ur', '2026-01-05T08:30:00Z'),
    ('usr-officer-1', 'Tariq Mehmood (Welfare Officer)', 'tariq.officer@example.com', '37405-1122334-1', 'officer', 'en', '2025-11-01T09:00:00Z'),
    ('usr-admin-1', 'Zainab Abbas (Policy Admin)', 'zainab.admin@example.com', '61101-9988776-3', 'admin', 'en', '2025-08-01T09:00:00Z'),
    ('usr-auditor-1', 'Farooq Ahmed (State Auditor)', 'farooq.auditor@example.com', '42201-7788990-5', 'auditor', 'en', '2025-09-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 2. CONSENTS SEED
INSERT INTO consents (id, citizen_id, granted_to_role, scope, is_active, updated_at)
VALUES
    ('cst-1', 'usr-citizen-1', 'helper', 'documents', TRUE, '2026-02-01T10:00:00Z'),
    ('cst-2', 'usr-citizen-1', 'officer', 'financial', TRUE, '2026-02-01T10:00:00Z'),
    ('cst-3', 'usr-citizen-2', 'helper', 'identity', FALSE, '2026-02-10T12:00:00Z') -- Explicitly Revoked Consent
ON CONFLICT (id) DO NOTHING;

-- 3. RULE VERSIONS SEED
INSERT INTO rule_versions (id, version_number, min_poverty_score, max_monthly_income, required_docs, auto_approve_threshold, human_handoff_threshold, is_active, created_by, created_at)
VALUES
    ('rule-v1', 1, 0.00, 30000, '["CNIC", "Death Certificate of Husband"]'::jsonb, 0.85, 0.50, TRUE, 'usr-admin-1', '2026-01-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. MOCK NADRA RECORDS SEED (Pakistani Edge Cases)
INSERT INTO mock_nadra_records (cnic_mock, full_name, father_or_husband_name, is_widow, monthly_income, district, is_flagged_fraud)
VALUES
    ('35201-1234567-8', 'Rashida Bibi', 'Muhammad Bashir', TRUE, 18000, 'Lahore', FALSE),
    ('35201-9999999-9', 'Muhammad Ali', 'Ghulam Ali', FALSE, 22000, 'Rawalpindi', FALSE), -- Spelling variance test case
    ('42101-5555555-5', 'Zubaida Begum', 'Tariq Aziz', TRUE, 48000, 'Karachi', FALSE), -- High income ceiling test case
    ('37405-3333333-3', 'Perveen Akhtar', 'Ghulam Nabi', TRUE, 12000, 'Faisalabad', TRUE) -- Blacklist fraud flag test case
ON CONFLICT (cnic_mock) DO NOTHING;

-- 5. CASES SEED
INSERT INTO cases (id, citizen_id, citizen_name, cnic_mock, helper_id, assigned_officer_id, rule_version_id, status, confidence_score, extracted_data, citizen_explanation_en, citizen_explanation_ur, auditor_trace, created_at)
VALUES
    (
        'case-101',
        'usr-citizen-1',
        'Rashida Bibi',
        '35201-1234567-8',
        'usr-helper-1',
        NULL,
        'rule-v1',
        'auto_approved',
        0.94,
        '{"fullName": "Rashida Bibi", "cnic": "35201-1234567-8", "monthlyIncome": 18000, "isWidow": true, "district": "Lahore", "ocrConfidence": 0.98, "nameSimilarity": 1.0}'::jsonb,
        'Your relief grant of PKR 10,500 has been approved via Raast. Your identity and widow record were verified with 94% confidence.',
        'آپ کی 10,500 روپے کی مالی امداد راست کے ذریعے منظور کر لی گئی ہے۔ آپ کی بیوہ تصدیق مکمل ہو چکی ہے۔',
        '{"model": "gemini-2.5-flash", "timestamp": "2026-02-15T11:20:00Z", "inputHash": "hash-8f192b", "fuzzyMatchScore": 1.0, "ruleVersionId": "rule-v1", "ocrClarityScore": 0.98, "asymmetricRiskFlags": [], "decisionPath": "AUTO_APPROVED_CRITERIA_MET"}'::jsonb,
        '2026-02-15T11:20:00Z'
    ),
    (
        'case-102',
        'usr-citizen-2',
        'Mohammad Ali (Zubaida Household)',
        '35201-9999999-9',
        NULL,
        'usr-officer-1',
        'rule-v1',
        'human_review',
        0.48,
        '{"fullName": "Mohammad Ali", "cnic": "35201-9999999-9", "monthlyIncome": 22000, "isWidow": false, "district": "Rawalpindi", "ocrConfidence": 0.85, "nameSimilarity": 0.88}'::jsonb,
        'AI Confidence Low (48%): Transliterated name spelling variance (Mohammad vs Muhammad) and widow status unclear. Escalated to Welfare Officer Tariq.',
        'کمپیوٹر نے آپ کی درخواست میں نام کے ہجے کا فرق پایا ہے۔ آپ کا کیس انسانی افسر کے پاس بھیج دیا گیا ہے۔',
        '{"model": "gemini-2.5-flash", "timestamp": "2026-02-16T14:10:00Z", "inputHash": "hash-3e710a", "fuzzyMatchScore": 0.88, "ruleVersionId": "rule-v1", "ocrClarityScore": 0.85, "asymmetricRiskFlags": ["NAME_SPELLING_VARIANCE", "NOT_WIDOW_IN_NADRA"], "decisionPath": "ASYMMETRIC_RISK_HUMAN_HANDOFF"}'::jsonb,
        '2026-02-16T14:10:00Z'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. IMMUTABLE AUDIT LOGS SEED
INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action_type, target_id, metadata, timestamp)
VALUES
    ('log-1', 'system', 'DPI Initialization', 'system', 'RULE_UPDATED', 'rule-v1', '{"version": 1, "maxIncome": 30000, "autoThreshold": 0.85}'::jsonb, '2026-01-01T00:00:00Z'),
    ('log-2', 'usr-citizen-1', 'Rashida Bibi', 'citizen', 'CONSENT_GRANTED', 'cst-1', '{"role": "helper", "scope": "documents"}'::jsonb, '2026-02-01T10:00:00Z'),
    ('log-3', 'usr-citizen-2', 'Zubaida Begum', 'citizen', 'CONSENT_REVOKED', 'cst-3', '{"role": "helper", "scope": "identity"}'::jsonb, '2026-02-10T12:00:00Z'),
    ('log-4', 'ai-engine', 'Asymmetric Risk Router', 'system', 'AI_DECISION', 'case-101', '{"confidence": 0.94, "decision": "auto_approved"}'::jsonb, '2026-02-15T11:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- 7. SCAM REPORTS SEED
INSERT INTO scam_reports (id, raw_message, is_scam, confidence, scam_type, district, explanation_simple, created_at)
VALUES
    ('scam-1', '8171: Mubarak! Aap ka 25,000 Ka Ehsaas Relief Pass Hogaya Hai. Call 0300-1234567 for Raast pin.', TRUE, 0.99, 'PHISHING_FAKE_8171', 'Lahore', 'Fraud Alert: Official government alerts never ask for PINs or direct call backs on personal mobile numbers.', '2026-02-10T15:00:00Z'),
    ('scam-2', 'BISP Alert: Please visit your nearest registered biometric center in Lahore for biometric verification.', FALSE, 0.92, 'LEGITIMATE_NOTICE', 'Lahore', 'Safe message: Advises visiting registered official physical biometric centers.', '2026-02-12T09:30:00Z')
ON CONFLICT (id) DO NOTHING;
