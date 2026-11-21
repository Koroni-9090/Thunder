/**
 * In-Memory Mock Database Container
 * Preseeded with Pakistani edge cases, DPI services, multi-tenant state, and audit trails.
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 */

import {
  User,
  Consent,
  RuleVersion,
  CaseRecord,
  AuditLog,
  MockNadraRecord,
  ScamReport,
  NotificationItem,
  WebhookConfig,
  SubscriptionUsage,
  BackgroundJob,
} from './types';

class MockDatabase {
  users: User[] = [
    {
      id: 'usr-citizen-1',
      name: 'Rashida Bibi',
      email: 'rashida.widow@example.com',
      cnic_mock: '35201-1234567-8',
      role: 'citizen',
      language_pref: 'ur',
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr-citizen-2',
      name: 'Zubaida Begum',
      email: 'zubaida.begum@example.com',
      cnic_mock: '42101-5555555-5',
      role: 'citizen',
      language_pref: 'ur',
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'usr-citizen-3',
      name: 'Perveen Akhtar',
      email: 'perveen.akhtar@example.com',
      cnic_mock: '37405-3333333-3',
      role: 'citizen',
      language_pref: 'ur',
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'usr-helper-1',
      name: 'Khadija Parveen (Social Mobilizer)',
      email: 'khadija.helper@example.com',
      cnic_mock: '35201-9876543-2',
      role: 'helper',
      language_pref: 'ur',
      created_at: '2026-01-05T08:30:00Z',
    },
    {
      id: 'usr-officer-1',
      name: 'Tariq Mehmood (Welfare Officer)',
      email: 'tariq.officer@example.com',
      cnic_mock: '37405-1122334-1',
      role: 'officer',
      language_pref: 'en',
      created_at: '2025-11-01T09:00:00Z',
    },
    {
      id: 'usr-admin-1',
      name: 'Zainab Abbas (Policy Admin)',
      email: 'zainab.admin@example.com',
      cnic_mock: '61101-9988776-3',
      role: 'admin',
      language_pref: 'en',
      created_at: '2025-08-01T09:00:00Z',
    },
    {
      id: 'usr-auditor-1',
      name: 'Farooq Ahmed (State Auditor)',
      email: 'farooq.auditor@example.com',
      cnic_mock: '42201-7788990-5',
      role: 'auditor',
      language_pref: 'en',
      created_at: '2025-09-01T09:00:00Z',
    },
  ];

  consents: Consent[] = [
    {
      id: 'cst-1',
      citizen_id: 'usr-citizen-1',
      granted_to_role: 'helper',
      scope: 'documents',
      is_active: true,
      updated_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'cst-2',
      citizen_id: 'usr-citizen-1',
      granted_to_role: 'officer',
      scope: 'financial',
      is_active: true,
      updated_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'cst-3',
      citizen_id: 'usr-citizen-2',
      granted_to_role: 'helper',
      scope: 'identity',
      is_active: false, // explicitly revoked consent
      updated_at: '2026-02-10T12:00:00Z',
    },
  ];

  ruleVersions: RuleVersion[] = [
    {
      id: 'rule-v1',
      version_number: 1,
      min_poverty_score: 0,
      max_monthly_income: 30000,
      required_docs: ['CNIC', 'Death Certificate of Husband'],
      auto_approve_threshold: 0.85,
      human_handoff_threshold: 0.50,
      is_active: true,
      created_by: 'usr-admin-1',
      created_at: '2026-01-01T00:00:00Z',
    },
  ];

  nadraRecords: MockNadraRecord[] = [
    {
      cnic_mock: '35201-1234567-8',
      full_name: 'Rashida Bibi',
      father_or_husband_name: 'Muhammad Bashir',
      is_widow: true,
      monthly_income: 18000,
      district: 'Lahore',
      is_flagged_fraud: false,
    },
    {
      cnic_mock: '35201-9999999-9',
      full_name: 'Muhammad Ali', // Notice: document might say Mohammad Ali
      father_or_husband_name: 'Ghulam Ali',
      is_widow: false,
      monthly_income: 22000,
      district: 'Rawalpindi',
      is_flagged_fraud: false,
    },
    {
      cnic_mock: '42101-5555555-5',
      full_name: 'Zubaida Begum',
      father_or_husband_name: 'Tariq Aziz',
      is_widow: true,
      monthly_income: 48000, // Above 30,000 threshold
      district: 'Karachi',
      is_flagged_fraud: false,
    },
    {
      cnic_mock: '37405-3333333-3',
      full_name: 'Perveen Akhtar',
      father_or_husband_name: 'Ghulam Nabi',
      is_widow: true,
      monthly_income: 12000,
      district: 'Faisalabad',
      is_flagged_fraud: true, // Blacklisted / fraud flag
    },
  ];

  cases: CaseRecord[] = [
    {
      id: 'case-101',
      citizen_id: 'usr-citizen-1',
      citizen_name: 'Rashida Bibi',
      cnic_mock: '35201-1234567-8',
      helper_id: 'usr-helper-1',
      assigned_officer_id: null,
      rule_version_id: 'rule-v1',
      status: 'auto_approved',
      confidence_score: 0.94,
      extracted_data: {
        fullName: 'Rashida Bibi',
        cnic: '35201-1234567-8',
        monthlyIncome: 18000,
        isWidow: true,
        district: 'Lahore',
        ocrConfidence: 0.98,
        nameSimilarity: 1.0,
      },
      citizen_explanation_en:
        'Your relief grant of PKR 10,500 has been approved via Raast. Your identity and widow record were verified with 94% confidence.',
      citizen_explanation_ur:
        'آپ کی 10,500 روپے کی مالی امداد راست کے ذریعے منظور کر لی گئی ہے۔ آپ کی بیوہ تصدیق مکمل ہو چکی ہے۔',
      auditor_trace: {
        model: 'gemini-2.5-flash',
        timestamp: '2026-02-15T11:20:00Z',
        inputHash: 'hash-8f192b',
        fuzzyMatchScore: 1.0,
        ruleVersionId: 'rule-v1',
        ocrClarityScore: 0.98,
        asymmetricRiskFlags: [],
        decisionPath: 'AUTO_APPROVED_CRITERIA_MET',
      },
      created_at: '2026-02-15T11:20:00Z',
    },
    {
      id: 'case-102',
      citizen_id: 'usr-citizen-2',
      citizen_name: 'Mohammad Ali (Zubaida Household)',
      cnic_mock: '35201-9999999-9',
      helper_id: null,
      assigned_officer_id: 'usr-officer-1',
      rule_version_id: 'rule-v1',
      status: 'human_review',
      confidence_score: 0.48, // Low confidence due to name spelling & widow flag
      extracted_data: {
        fullName: 'Mohammad Ali',
        cnic: '35201-9999999-9',
        monthlyIncome: 22000,
        isWidow: false,
        district: 'Rawalpindi',
        ocrConfidence: 0.85,
        nameSimilarity: 0.88,
      },
      citizen_explanation_en:
        'AI Confidence Low (48%): Transliterated name spelling variance (Mohammad vs Muhammad) and widow status unclear. Escalated to Welfare Officer Tariq.',
      citizen_explanation_ur:
        'کمپیوٹر نے آپ کی درخواست میں نام کے ہجے کا فرق پایا ہے۔ آپ کا کیس انسانی افسر کے پاس بھیج دیا گیا ہے۔',
      auditor_trace: {
        model: 'gemini-2.5-flash',
        timestamp: '2026-02-16T14:10:00Z',
        inputHash: 'hash-3e710a',
        fuzzyMatchScore: 0.88,
        ruleVersionId: 'rule-v1',
        ocrClarityScore: 0.85,
        asymmetricRiskFlags: ['NAME_SPELLING_VARIANCE', 'NOT_WIDOW_IN_NADRA'],
        decisionPath: 'ASYMMETRIC_RISK_HUMAN_HANDOFF',
      },
      created_at: '2026-02-16T14:10:00Z',
    },
  ];

  auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actor_id: 'system',
      actor_role: 'system',
      action_type: 'RULE_UPDATED',
      target_id: 'rule-v1',
      metadata: { version: 1, maxIncome: 30000, autoThreshold: 0.85 },
      timestamp: '2026-01-01T00:00:00Z',
    },
    {
      id: 'log-2',
      actor_id: 'usr-citizen-1',
      actor_role: 'citizen',
      action_type: 'CONSENT_GRANTED',
      target_id: 'cst-1',
      metadata: { role: 'helper', scope: 'documents' },
      timestamp: '2026-02-01T10:00:00Z',
    },
    {
      id: 'log-3',
      actor_id: 'usr-citizen-2',
      actor_role: 'citizen',
      action_type: 'CONSENT_REVOKED',
      target_id: 'cst-3',
      metadata: { role: 'helper', scope: 'identity' },
      timestamp: '2026-02-10T12:00:00Z',
    },
    {
      id: 'log-4',
      actor_id: 'ai-engine',
      actor_role: 'system',
      action_type: 'AI_DECISION',
      target_id: 'case-101',
      metadata: { confidence: 0.94, decision: 'auto_approved' },
      timestamp: '2026-02-15T11:20:00Z',
    },
  ];

  scamReports: ScamReport[] = [
    {
      id: 'scam-1',
      raw_message: '8171: Mubarak! Aap ka 25,000 Ka Ehsaas Relief Pass Hogaya Hai. Call 0300-1234567 for Raast pin.',
      is_scam: true,
      confidence: 0.99,
      scam_type: 'PHISHING_FAKE_8171',
      district: 'Lahore',
      explanation_simple: 'Fraud Alert: Official government alerts never ask for PINs or direct call backs on personal mobile numbers.',
      created_at: '2026-02-10T15:00:00Z',
    },
    {
      id: 'scam-2',
      raw_message: 'BISP Alert: Please visit your nearest registered biometric center in Lahore for biometric verification.',
      is_scam: false,
      confidence: 0.92,
      scam_type: 'LEGITIMATE_NOTICE',
      district: 'Lahore',
      explanation_simple: 'Safe message: Advises visiting registered official physical biometric centers.',
      created_at: '2026-02-12T09:30:00Z',
    },
  ];

  notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-citizen-1',
      channel: 'sms',
      title: 'Raast Relief Disbursed',
      body: 'PKR 10,500 has been sent to your Raast account for Case #case-101.',
      bodyUr: 'آپ کی کیس 101 کی امداد 10,500 روپے راست پر منتقل کر دی گئی ہے۔',
      isRead: false,
      createdAt: '2026-02-15T11:21:00Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-officer-1',
      channel: 'in_app',
      title: 'New Case Needs Human Review',
      body: 'Case #case-102 escalated by AI due to low confidence (48%).',
      isRead: false,
      createdAt: '2026-02-16T14:11:00Z',
    },
  ];

  webhooks: WebhookConfig[] = [
    {
      id: 'wh-1',
      name: 'BISP Central ERP Webhook',
      url: 'https://api.bisp.gov.pk/v2/dpi-events',
      events: ['case.approved', 'raast.disbursed', 'consent.revoked'],
      secretKey: 'whsec_bisp_secret_thunder',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      lastDeliveryStatus: 'SUCCESS',
      lastDeliveryAt: '2026-02-15T11:21:00Z',
    },
  ];

  subscriptions: Record<string, SubscriptionUsage> = {
    'tenant-punjab-relief': {
      tenantId: 'tenant-punjab-relief',
      planName: 'Enterprise DPI',
      apiCallsLimit: 500000,
      apiCallsUsed: 14200,
      casesLimit: 50000,
      casesUsed: 1204,
      aiTokensUsed: 984000,
      resetDate: '2026-03-01T00:00:00Z',
    },
    'tenant-kpk-flood': {
      tenantId: 'tenant-kpk-flood',
      planName: 'Pro Government',
      apiCallsLimit: 100000,
      apiCallsUsed: 42100,
      casesLimit: 10000,
      casesUsed: 4890,
      aiTokensUsed: 412000,
      resetDate: '2026-03-01T00:00:00Z',
    },
    'tenant-ngo-mobilizer': {
      tenantId: 'tenant-ngo-mobilizer',
      planName: 'Starter Free',
      apiCallsLimit: 10000,
      apiCallsUsed: 840,
      casesLimit: 1000,
      casesUsed: 82,
      aiTokensUsed: 31000,
      resetDate: '2026-03-01T00:00:00Z',
    },
  };

  backgroundJobs: BackgroundJob[] = [
    {
      id: 'job-1',
      type: 'SYNC_OFFLINE_QUEUE',
      status: 'COMPLETED',
      payload: { count: 3, helperId: 'usr-helper-1' },
      result: { synced: 3, failed: 0 },
      createdAt: '2026-02-18T08:00:00Z',
      completedAt: '2026-02-18T08:00:02Z',
    },
  ];

  // OTP temporary stores for signup/login demo
  otpStore: Record<string, { otp: string; expiresAt: number }> = {
    'rashida.widow@example.com': { otp: '123456', expiresAt: Date.now() + 86400000 },
    'khadija.helper@example.com': { otp: '123456', expiresAt: Date.now() + 86400000 },
  };

  setConsent(citizenId: string, role: string, scope: string, isActive: boolean, actorId?: string): Consent {
    let consent = this.consents.find((c) => c.citizen_id === citizenId && c.granted_to_role === role && c.scope === scope);
    if (!consent) {
      consent = {
        id: `cst-${Date.now()}`,
        citizen_id: citizenId,
        granted_to_role: role as any,
        scope: scope as any,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };
      this.consents.push(consent);
    } else {
      consent.is_active = isActive;
      consent.updated_at = new Date().toISOString();
    }

    this.addAuditLog({
      actor_id: actorId || citizenId,
      actor_role: 'citizen',
      action_type: isActive ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      target_id: citizenId,
      metadata: { role, scope, isActive },
    });

    return consent;
  }

  getCaseById(id: string): CaseRecord | undefined {
    return this.cases.find((c) => c.id === id);
  }

  getCases(): CaseRecord[] {
    return this.cases;
  }

  getScamReports(): ScamReport[] {
    return this.scamReports;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  getRaastPayments(): any[] {
    return this.auditLogs.filter((a) => a.action_type === 'RAAST_DISBURSED');
  }

  getActiveRule(): RuleVersion {
    return this.getActiveRuleVersion();
  }

  createNotification(notif: any): any {
    this.notifications.unshift(notif);
    return notif;
  }

  getUsers(): User[] {
    return this.users;
  }

  getConsents(): Consent[] {
    return this.consents;
  }

  createAuditLog(entry: AuditLog): AuditLog {
    this.auditLogs.unshift(entry);
    return entry;
  }

  dispatchWebhookEvent(event: string, payload: any): void {
    const activeHooks = this.webhooks.filter((w) => w.isActive && (w.events.includes(event) || w.events.includes('*')));
    for (const hook of activeHooks) {
      hook.lastDeliveryStatus = 'SUCCESS';
      hook.lastDeliveryAt = new Date().toISOString();
    }
  }

  // Helper Methods
  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getNadraRecord(cnic: string): MockNadraRecord | undefined {
    const clean = cnic.replace(/[^0-9]/g, '');
    return this.nadraRecords.find((r) => r.cnic_mock.replace(/[^0-9]/g, '') === clean);
  }

  getActiveRuleVersion(): RuleVersion {
    const active = this.ruleVersions.find((r) => r.is_active);
    return (
      active || {
        id: 'rule-fallback',
        version_number: 1,
        min_poverty_score: 0,
        max_monthly_income: 30000,
        required_docs: ['CNIC'],
        auto_approve_threshold: 0.85,
        human_handoff_threshold: 0.5,
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
      }
    );
  }

  getConsentsForCitizen(citizenId: string): Consent[] {
    return this.consents.filter((c) => c.citizen_id === citizenId);
  }

  hasActiveConsent(citizenId: string, role: string, scope?: string): boolean {
    // Admin and Auditor can read for governance, but helper must have active consent
    if (role === 'admin' || role === 'auditor') return true;
    const consent = this.consents.find(
      (c) =>
        c.citizen_id === citizenId &&
        c.granted_to_role === role &&
        (!scope || c.scope === scope)
    );
    return consent ? consent.is_active : false;
  }

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  addCase(caseData: Omit<CaseRecord, 'id' | 'created_at'>): CaseRecord {
    const newCase: CaseRecord = {
      ...caseData,
      id: `case-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.cases.unshift(newCase);
    return newCase;
  }
}

// Global singleton for Next.js hot reload persistence
const globalForDb = global as unknown as { __sahulatDb?: MockDatabase };
export const db = globalForDb.__sahulatDb || new MockDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.__sahulatDb = db;
