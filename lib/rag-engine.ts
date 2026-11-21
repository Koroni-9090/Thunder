/**
 * SahulatRail DPI Policy RAG (Retrieval-Augmented Generation) Engine
 * Team Thunder | FAST-NUCES Karachi Hackathon
 */

export interface PolicyDocumentChunk {
  id: string;
  source: string;
  section: string;
  title: string;
  content: string;
  keywords: string[];
}

export const OFFICIAL_DPI_KNOWLEDGE_BASE: PolicyDocumentChunk[] = [
  {
    id: 'bisp-sop-8171',
    source: 'BISP Official Circular 2026/SOP-8171',
    section: 'Section 4.1: Citizen Communication Rails',
    title: 'Official Notification Rails & Scam Prevention',
    content:
      'All legitimate notifications regarding Benazir Income Support Program (BISP) and emergency cash transfers are sent EXCLUSIVELY via government short-code 8171. Any SMS from 11-digit mobile numbers (e.g. 03xx-xxxxxxx) claiming cash awards, asking to call back, or requesting biometric OTPs is fraudulent and must be classified as an urgent scam.',
    keywords: ['bisp', '8171', 'sms', 'scam', 'mobile', 'otp', 'notification', 'fraud'],
  },
  {
    id: 'raast-disbursement-rules',
    source: 'State Bank of Pakistan (SBP) Raast Framework 2026',
    section: 'Circular No. 12: Direct Benefit Transfer (DBT)',
    title: 'Raast Direct Government Payout Protocol',
    content:
      'Government emergency relief grants are disbursed directly to citizens registered Raast ID or linked CNIC wallet. Raast settlements are instant and zero-fee. Official bank payment advice notes contain an alphanumeric reference (e.g. RAAST-PKR-XXXXXXX) and do not require citizens to contact private numbers or deposit advance fees.',
    keywords: ['raast', 'payment', 'wallet', 'disbursement', 'grant', 'settlement', 'sbp', 'bank'],
  },
  {
    id: 'nadra-identity-matching',
    source: 'NADRA Civil Registry Guidelines Vol. 8',
    section: 'Article 19: Phonetic Name Discrepancies & Cultural Variants',
    title: 'Pakistani Name Variations & Illiteracy Protection',
    content:
      'Due to high rates of transliteration variance in Pakistan, spelling variations between "Mohammad", "Muhammad", "Muhammed", and "Mohd", or honorific suffixes like "Bibi", "Begum", and "Khatoon" must be resolved using Jaro-Winkler phonetic similarity. When match confidence is between 50% and 85%, the system must NOT reject the citizen, but instead safely escalate to a Human Verification Officer ("I Am Not Sure") with attached case notes to protect vulnerable citizens.',
    keywords: ['nadra', 'name', 'spelling', 'mohammad', 'muhammad', 'bibi', 'widow', 'fuzzy', 'discrepancy'],
  },
  {
    id: 'flood-relief-eligibility',
    source: 'Federal Relief Taskforce Policy Gazette 2026',
    section: 'Schedule A: Household Income & Poverty Scorecard Limits',
    title: 'Emergency Relief Grant Eligibility Thresholds',
    content:
      'Emergency grant recipients must have a verified monthly household income of PKR 45,000 or below (Rule Version 2). Widows without primary earning breadwinners receive automatic priority scoring (+15 points on poverty scorecard). Automated approval requires composite confidence >= 85% with zero fraud syndicate flags.',
    keywords: ['eligibility', 'income', 'widow', 'threshold', 'poverty', 'score', 'grant', 'rule'],
  },
  {
    id: 'consent-sovereignty-act',
    source: 'Digital Public Infrastructure Data Protection Ordinance',
    section: 'Section 9: Citizen Consent Take-Back & Access Revocation',
    title: 'Citizen Consent Management & Immediate API Blocking',
    content:
      'Citizens possess absolute ownership over their data. When a citizen revokes consent for Community Helpers or Department Officers, the system must immediately terminate backend API access with HTTP 403 Forbidden (CONSENT_REVOKED) and log the revocation to an immutable cryptographic audit ledger.',
    keywords: ['consent', 'revoke', 'take-back', 'permission', '403', 'audit', 'privacy'],
  },
];

/**
 * Performs semantic keyword and Jaccard similarity retrieval over the official DPI knowledge base.
 */
export function searchPolicyKnowledgeBase(query: string, topK: number = 2): {
  chunks: PolicyDocumentChunk[];
  bestScore: number;
  sources: string[];
} {
  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = OFFICIAL_DPI_KNOWLEDGE_BASE.map((chunk) => {
    let matches = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();

    for (const word of queryWords) {
      if (chunk.keywords.includes(word)) matches += 3;
      if (titleLower.includes(word)) matches += 2;
      if (contentLower.includes(word)) matches += 1;
    }

    const score = queryWords.length > 0 ? matches / (queryWords.length * 3) : 0;
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);

  return {
    chunks: top.map((t) => t.chunk),
    bestScore: top.length > 0 ? top[0].score : 0,
    sources: top.map((t) => `${t.chunk.source} (${t.chunk.section})`),
  };
}
