/**
 * AI Engine & Asymmetric Risk Router
 * "Wrong approvals cost more than slow approvals"
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { jaroWinklerSimilarity } from './fuzzy-matching';
import { CaseStatus, RuleVersion, MockNadraRecord } from './types';
import crypto from 'crypto';

export interface EvaluationInput {
  fullName: string;
  cnic: string;
  monthlyIncome: number;
  isWidow: boolean;
  district?: string;
  ocrConfidence?: number;
  forgerySuspect?: boolean;
}

export interface EvaluationResult {
  status: CaseStatus;
  confidence: number;
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
    thresholds: {
      autoApprove: number;
      humanHandoff: number;
    };
  };
}

/**
 * Evaluates a relief application with Asymmetric Risk Routing
 */
export async function evaluateReliefApplication(
  input: EvaluationInput,
  nadraRecord: MockNadraRecord | undefined,
  rule: RuleVersion
): Promise<EvaluationResult> {
  const timestamp = new Date().toISOString();
  const inputHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(input) + (nadraRecord?.cnic_mock || 'none'))
    .digest('hex')
    .substring(0, 12);

  const riskFlags: string[] = [];
  const ocrClarity = input.ocrConfidence ?? 0.92;

  // 1. Missing NADRA record check
  if (!nadraRecord) {
    riskFlags.push('CNIC_NOT_FOUND_IN_NADRA');
    return {
      status: 'human_review',
      confidence: 0.35,
      citizen_explanation_en:
        'AI Confidence Low (35%): Your CNIC was not found in the national registry. Case escalated to a Human Welfare Officer.',
      citizen_explanation_ur:
        'کمپیوٹر کو آپ کا شناختی کارڈ نادرا ریکارڈ میں نہیں ملا۔ آپ کا کیس انسانی افسر کو منتقل کر دیا گیا ہے۔',
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: 0.0,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'NADRA_RECORD_MISSING_ESCALATION',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  }

  // 2. Fraud Flag in NADRA
  if (nadraRecord.is_flagged_fraud) {
    riskFlags.push('NADRA_FRAUD_FLAG_ACTIVE');
    return {
      status: 'rejected',
      confidence: 0.99,
      citizen_explanation_en:
        'Application could not be approved. Security verification indicates an active registry hold. Please visit a NADRA Sahulat center.',
      citizen_explanation_ur:
        'آپ کی درخواست منظور نہیں ہو سکی۔ نادرا ریکارڈ میں سیکیورٹی مسئلہ ہے۔ قریبی نادرا سہولت سنٹر تشریف لے جائیں۔',
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: 1.0,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'SECURITY_FRAUD_BLACKLIST_REJECT',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  }

  // 3. Forgery check
  if (input.forgerySuspect) {
    riskFlags.push('DOCUMENT_FORGERY_DETECTED');
    return {
      status: 'human_review',
      confidence: 0.28,
      citizen_explanation_en:
        'AI Confidence Low (28%): Document visual anomalies detected. Escalated for physical document verification by Officer.',
      citizen_explanation_ur:
        'کاغذات میں گڑبڑ پائی گئی ہے۔ آپ کی فائل انسانی تصدیق کے لیے افسر کو بھیج دی گئی ہے۔',
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: 0.5,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'TAMPER_ANOMALY_ESCALATION',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  }

  // 4. Fuzzy Name Matching & Spelling Variance Detection
  const isExactRawMatch = input.fullName.trim().toLowerCase() === nadraRecord.full_name.trim().toLowerCase();
  const nameScore = jaroWinklerSimilarity(input.fullName, nadraRecord.full_name);
  if (!isExactRawMatch || nameScore < 0.95) {
    riskFlags.push(`NAME_SPELLING_VARIANCE_${Math.round(nameScore * 100)}%`);
  }

  // 5. Widow Verification Check
  if (!nadraRecord.is_widow) {
    riskFlags.push('APPLICANT_NOT_RECORDED_AS_WIDOW');
  }

  // 6. Income Ceiling Check
  const effectiveIncome = Math.max(input.monthlyIncome, nadraRecord.monthly_income);
  if (effectiveIncome > rule.max_monthly_income) {
    riskFlags.push(`INCOME_EXCEEDS_CEILING_${effectiveIncome}_VS_${rule.max_monthly_income}`);
    return {
      status: 'rejected',
      confidence: 0.92,
      citizen_explanation_en: `Your reported or verified household income (PKR ${effectiveIncome.toLocaleString()}) exceeds the government threshold of PKR ${rule.max_monthly_income.toLocaleString()}.`,
      citizen_explanation_ur: `آپ کی ماہانہ آمدنی حکومت کی مقررہ حد (${rule.max_monthly_income.toLocaleString()} روپے) سے زیادہ ہے۔`,
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: nameScore,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'INCOME_CEILING_EXCEEDED_REJECT',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  }

  // Calculate Asymmetric Risk Score
  // Asymmetric penalty: If name variance exists (< 0.95), hard cap score to 0.58 so it CANNOT auto-approve
  let compositeConfidence = 0.4 * nameScore + 0.3 * ocrClarity + 0.3 * (nadraRecord.is_widow ? 1.0 : 0.4);

  if (!isExactRawMatch || nameScore < 0.95) {
    // ASYMMETRIC SAFEGUARD: Wrong approvals cost more than slow approvals
    compositeConfidence = Math.min(compositeConfidence, 0.58);
  }

  compositeConfidence = Number(compositeConfidence.toFixed(2));

  // Routing Logic
  if (compositeConfidence >= rule.auto_approve_threshold && riskFlags.length === 0) {
    return {
      status: 'auto_approved',
      confidence: compositeConfidence,
      citizen_explanation_en: `Your relief grant of PKR 10,500 has been auto-approved via Raast. Your identity was verified with ${Math.round(
        compositeConfidence * 100
      )}% confidence.`,
      citizen_explanation_ur: `آپ کی 10,500 روپے کی مالی امداد راست کے ذریعے منظور کر لی گئی ہے۔ آپ کی شناخت ${Math.round(
        compositeConfidence * 100
      )} فیصد تصدیق ہو گئی ہے۔`,
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: nameScore,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'AUTO_APPROVAL_HIGH_CONFIDENCE',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  } else if (compositeConfidence >= rule.human_handoff_threshold) {
    // Between handoff threshold and auto-approve threshold: Needs more proof or review
    const isHumanReview = riskFlags.some((f) => f.includes('NAME_SPELLING_VARIANCE') || f.includes('NOT_WIDOW'));
    const status = isHumanReview ? 'human_review' : 'needs_more_proof';

    return {
      status,
      confidence: compositeConfidence,
      citizen_explanation_en: `AI Confidence Moderate (${Math.round(
        compositeConfidence * 100
      )}%): Record spelling variance or missing proof detected. Escalated to Welfare Officer Tariq for review.`,
      citizen_explanation_ur: `کمپیوٹر نے کاغذات میں کچھ فرق پایا ہے (${Math.round(
        compositeConfidence * 100
      )} فیصد یقین)۔ آپ کا کیس انسانی فلاحی افسر کو بھیج دیا گیا ہے۔`,
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: nameScore,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: isHumanReview ? 'ASYMMETRIC_RISK_HUMAN_HANDOFF' : 'NEEDS_SUPPLEMENTARY_PROOF',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  } else {
    // Low confidence: Human handoff
    return {
      status: 'human_review',
      confidence: compositeConfidence,
      citizen_explanation_en: `AI Confidence Low (${Math.round(
        compositeConfidence * 100
      )}%): Uncertain name/document match. Escalated to Human Officer.`,
      citizen_explanation_ur: `کمپیوٹر نام یا دستاویزات کی تصدیق نہیں کر سکا۔ آپ کا کیس فلاحی افسر کو بھیج دیا گیا ہے۔`,
      auditor_trace: {
        model: 'gemini-2.5-flash-asymmetric',
        timestamp,
        inputHash,
        fuzzyMatchScore: nameScore,
        ruleVersionId: rule.id,
        ocrClarityScore: ocrClarity,
        asymmetricRiskFlags: riskFlags,
        decisionPath: 'LOW_CONFIDENCE_HUMAN_HANDOFF',
        thresholds: {
          autoApprove: rule.auto_approve_threshold,
          humanHandoff: rule.human_handoff_threshold,
        },
      },
    };
  }
}

/**
 * Classifies SMS and WhatsApp messages for Relief Scams & Phishing
 */
export async function classifyScamMessage(rawMessage: string): Promise<{
  is_scam: boolean;
  confidence: number;
  scam_type: string;
  explanation_simple: string;
  explanation_ur: string;
  warning_signs: string[];
}> {
  const lower = rawMessage.toLowerCase();
  const warningSigns: string[] = [];

  // Check for common scam patterns in Pakistan
  if (lower.includes('030') || lower.includes('031') || lower.includes('032') || lower.includes('033') || lower.includes('034')) {
    warningSigns.push('Asks to call or message an unverified personal cellular number');
  }
  if (lower.includes('pin') || lower.includes('password') || lower.includes('otp') || lower.includes('code')) {
    warningSigns.push('Requests private financial PIN or OTP code');
  }
  if (lower.includes('mubarak') || lower.includes('won') || lower.includes('inam') || lower.includes('congratulations')) {
    warningSigns.push('Uses lottery-style urgency and celebratory language');
  }
  if (lower.includes('jazzcash') || lower.includes('easypaisa') || lower.includes('transfer fee')) {
    warningSigns.push('Demands advance fee or mobile transfer before disbursement');
  }

  // Official legitimate notices
  const isOfficialSender = lower.includes('8171') && !warningSigns.length && !lower.includes('call');

  if (isOfficialSender) {
    return {
      is_scam: false,
      confidence: 0.95,
      scam_type: 'LEGITIMATE_GOVERNMENT_NOTICE',
      explanation_simple: 'This appears to be an official informational notice from BISP/Ehsaas.',
      explanation_ur: 'یہ بی آئی ایس پی کا جائز اور محفوظ پیغام معلوم ہوتا ہے۔',
      warning_signs: [],
    };
  }

  if (warningSigns.length > 0 || lower.includes('25000') || lower.includes('pass hogaya') || lower.includes('benazir')) {
    return {
      is_scam: true,
      confidence: 0.98,
      scam_type: 'PHISHING_FAKE_RELIEF_SCAM',
      explanation_simple: 'FRAUD WARNING: Government relief is never disbursed via personal mobile numbers or advance fees.',
      explanation_ur: 'خطرہ: یہ دھوکہ دہی ہے۔ حکومت کبھی بھی نجی فون نمبر یا ایڈوانس فیس طلب نہیں کرتی۔',
      warning_signs: warningSigns.length ? warningSigns : ['Suspicious unregistered relief claim'],
    };
  }

  return {
    is_scam: false,
    confidence: 0.82,
    scam_type: 'GENERAL_MESSAGE',
    explanation_simple: 'No obvious fraud patterns detected. Always verify with official 8171 helpline.',
    explanation_ur: 'کوئی خطرہ نظر نہیں آیا۔ ہمیشہ سرکاری 8171 ہیلپ لائن سے تصدیق کریں۔',
    warning_signs: [],
  };
}

/**
 * Conversational DPI Assistant with "I am not sure" fallback
 */
export async function queryDpiAssistant(
  prompt: string,
  context?: { language?: 'ur' | 'en'; userRole?: string }
): Promise<{ text: string; confidence: number; isUncertain: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const lang = context?.language || 'en';

  // Check if query is inherently ambiguous, contradictory, or lacks details
  const lower = prompt.toLowerCase();
  const isAmbiguous =
    lower.includes('fake') ||
    lower.includes('bribe') ||
    lower.includes('not sure') ||
    lower.includes('bypass') ||
    lower.includes('cheating') ||
    lower.length < 5;

  if (isAmbiguous) {
    return {
      text:
        lang === 'ur'
          ? 'میں اس بات پر مکمل پراعتماد نہیں ہوں۔ غلط معلومات سے بچنے کے لیے میں آپ کو فلاحی افسر یا کمیونٹی ہیلپر سے رجوع کرنے کا مشورہ دیتا ہوں۔'
          : 'I am not sure about this information. To prevent errors in relief grants, I recommend speaking directly with a Welfare Officer or Community Helper.',
      confidence: 0.42,
      isUncertain: true,
    };
  }

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const systemInstruction = `You are the SahulatRail DPI Assistant created by Team Thunder for Pakistan's Digital Public Infrastructure.
CRITICAL MANDATE:
1. Speak in a helpful, respectful, and energetic tone suitable for low-literacy citizens and community helpers.
2. If any policy detail, CNIC number, or rule is uncertain, you MUST say "I am not sure" and advise consulting a designated officer. Never hallucinate eligibility.
3. Respond in ${lang === 'ur' ? 'simple, clean Urdu' : 'concise, simple English (2-3 sentences max)'}.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] }],
      });
      const responseText = result.response.text();
      return {
        text: responseText,
        confidence: 0.91,
        isUncertain: responseText.toLowerCase().includes('not sure'),
      };
    } catch {
      // Graceful fallback to deterministic engine
    }
  }

  // Deterministic fallback answers
  if (lower.includes('apply') || lower.includes('grant') || lower.includes('emdaad') || lower.includes('relief')) {
    return {
      text:
        lang === 'ur'
          ? 'امدادی گرانٹ کے لیے آپ شناختی کارڈ کی تصویر اپ لوڈ کریں یا اپنے قریبی کمیونٹی ہیلپر سے رجوع کریں۔ نادرا تصدیق کے بعد رقم راست کے ذریعے اکاؤنٹ میں منتقل ہو جاتی ہے۔'
          : 'To apply for relief, upload your CNIC photo in the Citizen Portal or visit your local Community Helper. Once verified against NADRA, funds are disbursed instantly via Raast.',
      confidence: 0.96,
      isUncertain: false,
    };
  }

  if (lower.includes('sms') || lower.includes('8171') || lower.includes('fraud') || lower.includes('scam')) {
    return {
      text:
        lang === 'ur'
          ? 'حکومت صرف 8171 سے سرکاری ایس ایم ایس بھیجتی ہے۔ اگر کسی نجی نمبر سے فون یا کوڈ مانگا جائے تو یہ دھوکہ ہے۔ کبھی پن یا کوڈ شیئر نہ کریں۔'
          : 'Official government SMS alerts only come from 8171. Never share your Raast PIN, OTP, or pay advance fees to any private mobile caller.',
      confidence: 0.97,
      isUncertain: false,
    };
  }

  return {
    text:
      lang === 'ur'
        ? 'میں اس سوال کے بارے میں مکمل یقینی نہیں ہوں۔ براہ کرم قریبی احساس سہولت مرکز یا ہیلپ لائن 8171 سے رابطہ کریں۔'
        : 'I am not sure about the specific details of this request. Please contact the official 8171 helpline or visit your local Sahulat Markaz.',
    confidence: 0.5,
    isUncertain: true,
  };
}
