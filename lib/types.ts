/**
 * SahulatRail Types and Schemas
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 */

export type UserRole = 'citizen' | 'helper' | 'officer' | 'admin' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  cnic_mock: string;
  role: UserRole;
  language_pref: 'ur' | 'en';
  created_at: string;
}

export type ConsentScope = 'identity' | 'financial' | 'documents';

export interface Consent {
  id: string;
  citizen_id: string;
  granted_to_role: UserRole;
  scope: ConsentScope;
  is_active: boolean;
  updated_at: string;
}

export interface RuleVersion {
  id: string;
  version_number: number;
  min_poverty_score: number;
  max_monthly_income: number;
  required_docs: string[];
  auto_approve_threshold: number;
  human_handoff_threshold: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export type CaseStatus =
  | 'draft'
  | 'auto_approved'
  | 'needs_more_proof'
  | 'human_review'
  | 'approved'
  | 'rejected'
  | 'closed';

export interface CaseRecord {
  id: string;
  citizen_id: string;
  citizen_name?: string;
  cnic_mock: string;
  helper_id?: string | null;
  officer_id?: string | null;
  assigned_officer_id?: string | null;
  officer_notes?: string | null;
  rule_version_id: string;
  status: CaseStatus;
  confidence_score: number;
  extracted_data: {
    fullName?: string;
    fatherHusbandName?: string;
    cnic?: string;
    monthlyIncome?: number;
    district?: string;
    isWidow?: boolean;
    ocrConfidence?: number;
    nameSimilarity?: number;
    forgerySuspect?: boolean;
    uncertainty_reason?: string;
    [key: string]: any;
  };
  citizen_explanation_en: string;
  citizen_explanation_ur: string;
  auditor_trace: {
    model: string;
    timestamp: string;
    inputHash: string;
    fuzzyMatchScore: number;
    ruleVersionId: string;
    ocrClarityScore: number;
    asymmetricRiskFlags: string[];
    decisionPath: string;
    latencyMs?: number;
    assignedOfficer?: string | null;
    officerNotes?: string | null;
    officerAction?: string | null;
    overrideTimestamp?: string | null;
  };
  created_at: string;
  updated_at?: string;
}

export type AuditActionType =
  | 'CASE_CREATED'
  | 'AI_DECISION'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_CORRECTED'
  | 'RULE_UPDATED'
  | 'OFFICER_ASSIGNED'
  | 'OFFICER_OVERRIDE'
  | 'OFFICER_ESCALATED'
  | 'OFFICER_CLOSED'
  | 'SCAM_CHECK'
  | 'AGENT_EXECUTION'
  | 'RAAST_DISBURSED';

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name?: string;
  actor_role: UserRole | 'system' | 'api_key';
  action_type: AuditActionType;
  target_id: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface MockNadraRecord {
  cnic_mock: string;
  full_name: string;
  father_or_husband_name: string;
  is_widow: boolean;
  monthly_income: number;
  district: string;
  is_flagged_fraud: boolean;
}

export interface ScamReport {
  id: string;
  raw_message: string;
  is_scam: boolean;
  confidence: number;
  scam_type?: string;
  district?: string;
  explanation_simple: string;
  created_at: string;
}

export type NotificationChannel = 'sms' | 'whatsapp' | 'email' | 'in_app';

export interface NotificationItem {
  id: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  bodyUr?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secretKey: string;
  isActive: boolean;
  createdAt: string;
  lastDeliveryStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  lastDeliveryAt?: string;
}

export interface SubscriptionUsage {
  tenantId: string;
  planName: 'Starter Free' | 'Pro Government' | 'Enterprise DPI';
  apiCallsLimit: number;
  apiCallsUsed: number;
  casesLimit: number;
  casesUsed: number;
  aiTokensUsed: number;
  resetDate: string;
}

export interface BackgroundJob {
  id: string;
  type: 'SYNC_OFFLINE_QUEUE' | 'RUN_DIGITAL_TWIN' | 'ANOMALY_SCAN' | 'BATCH_DISBURSE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payload: any;
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
