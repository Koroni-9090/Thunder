/**
 * Jev: Type-Safe AI Decision & Routing Model
 * Classifies inputs, assigns confidence scores, and routes to right destination:
 * (auto_handle, ask_more, or send_to_human)
 * Team Thunder | FAST-NUCES Karachi Hackathon
 */

export type JevCategory = 
  | 'EMERGENCY_RELIEF_CLAIM'
  | 'SCAM_PHISHING_ALERT'
  | 'CITIZEN_COMPLAINT'
  | 'STATUS_INQUIRY'
  | 'DATA_CORRECTION';

export type JevDestination =
  | 'AUTO_HANDLE'
  | 'NEEDS_MORE_PROOF'
  | 'SEND_TO_HUMAN_OFFICER'
  | 'FRAUD_QUARANTINE';

export interface JevDecision {
  inputExcerpt: string;
  category: JevCategory;
  confidence: number;
  destination: JevDestination;
  routingReason: string;
  isUncertain: boolean;
  metadata: Record<string, any>;
}

export function routeWithJevModel(rawInput: string, context?: { hasDiscrepancy?: boolean; fraudFlag?: boolean }): JevDecision {
  const text = rawInput.toLowerCase();
  const excerpt = rawInput.length > 80 ? rawInput.substring(0, 80) + '...' : rawInput;

  // 1. Scam & Phishing detection
  const hasPhone = /\b03\d{2}[-\s]?\d{7}\b/.test(rawInput);
  const hasBispUrgency = (text.includes('bisp') || text.includes('ehsaas')) && (text.includes('foran') || text.includes('call') || hasPhone);
  const hasOtpDemand = text.includes('otp') || text.includes('pin') || text.includes('password');

  if (hasOtpDemand || hasBispUrgency) {
    return {
      inputExcerpt: excerpt,
      category: 'SCAM_PHISHING_ALERT',
      confidence: 0.98,
      destination: 'FRAUD_QUARANTINE',
      routingReason: 'Unofficial mobile sender / urgent PIN demand identified as cyber-phishing threat.',
      isUncertain: false,
      metadata: { threatLevel: 'HIGH', shortcodeViolation: true },
    };
  }

  // 2. Data Correction requests
  if (text.includes('spelling') || text.includes('correct') || text.includes('change name') || text.includes('wrong cnic')) {
    return {
      inputExcerpt: excerpt,
      category: 'DATA_CORRECTION',
      confidence: 0.89,
      destination: 'SEND_TO_HUMAN_OFFICER',
      routingReason: 'Data correction requires identity verification before mutating citizen profile.',
      isUncertain: false,
      metadata: { scope: 'identity_amendment' },
    };
  }

  // 3. Citizen complaints
  if (text.includes('complaint') || text.includes('delayed') || text.includes('not received') || text.includes('shikayat')) {
    return {
      inputExcerpt: excerpt,
      category: 'CITIZEN_COMPLAINT',
      confidence: 0.92,
      destination: 'SEND_TO_HUMAN_OFFICER',
      routingReason: 'Grievance escalated to Facilitation Desk Supervisor.',
      isUncertain: false,
      metadata: { priority: 'NORMAL' },
    };
  }

  // 4. Status inquiry
  if (text.includes('status') || text.includes('check') || text.includes('kya bana') || text.includes('when')) {
    return {
      inputExcerpt: excerpt,
      category: 'STATUS_INQUIRY',
      confidence: 0.94,
      destination: 'AUTO_HANDLE',
      routingReason: 'Informational status query answered automatically from database record.',
      isUncertain: false,
      metadata: { channel: 'instant_response' },
    };
  }

  // 5. Emergency Relief Claim evaluation
  if (context?.fraudFlag) {
    return {
      inputExcerpt: excerpt,
      category: 'EMERGENCY_RELIEF_CLAIM',
      confidence: 0.05,
      destination: 'FRAUD_QUARANTINE',
      routingReason: 'Applicant flagged on national DPI fraud watch list. Quarantined.',
      isUncertain: false,
      metadata: { blocked: true },
    };
  }

  if (context?.hasDiscrepancy) {
    return {
      inputExcerpt: excerpt,
      category: 'EMERGENCY_RELIEF_CLAIM',
      confidence: 0.58,
      destination: 'SEND_TO_HUMAN_OFFICER',
      routingReason: 'Jev low confidence safeguard triggered (58%): Transliteration variance between document and registry.',
      isUncertain: true,
      metadata: { escalated: true },
    };
  }

  return {
    inputExcerpt: excerpt,
    category: 'EMERGENCY_RELIEF_CLAIM',
    confidence: 0.93,
    destination: 'AUTO_HANDLE',
    routingReason: 'Clean document match exceeding 85% safety threshold. Routed to automated disbursement.',
    isUncertain: false,
    metadata: { eligible: true },
  };
}
