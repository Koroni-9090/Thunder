/**
 * Server-Side Authentication, RBAC, Consent Enforcement & Rate Limiting
 * Team Thunder | FAST-NUCES Karachi AI Hackathon
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';
import { UserRole } from './types';
import { validateApiKey } from './api-keys';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sahulatrail-thunder-secret-key-fast-hackathon-2026'
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cnic_mock: string;
}

// In-Memory Sliding Window Rate Limiter: 120 requests/minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userRate = rateLimitMap.get(identifier);

  if (!userRate || now > userRate.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (userRate.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  userRate.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userRate.count };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    cnic: user.cnic_mock,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  // 1. Check API Key header
  const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('X-API-KEY');
  if (apiKeyHeader) {
    const keyRecord = validateApiKey(apiKeyHeader);
    if (keyRecord) {
      return {
        id: `apikey-${keyRecord.id}`,
        name: keyRecord.name,
        email: `${keyRecord.keyPrefix}@api.sahulatrail.gov.pk`,
        role: keyRecord.role === 'partner' ? 'helper' : (keyRecord.role as UserRole),
        cnic_mock: 'API-KEY-AUTH',
      };
    }
  }

  // 2. Check Bearer Authorization Header
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // 3. Check Cookie
  if (!token) {
    token = req.cookies.get('sahulat_session')?.value || null;
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      cnic_mock: (payload.cnic as string) || '',
    };
  } catch {
    return null;
  }
}

/**
 * Server-side Guard: Authenticates and optionally checks required roles and rate limits
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: SessionUser } | NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded (120 reqs/min). Please slow down.',
      },
      { status: 429 }
    );
  }

  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid JWT Bearer token, session cookie, or x-api-key.',
      },
      { status: 401 }
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Role '${user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(', ')}.`,
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Server-side Guard: Verifies active citizen consent before allowing Helper/Officer access
 */
export function requireConsentCheck(
  citizenId: string,
  user: SessionUser,
  scope?: string
): NextResponse | null {
  // Citizens can access their own data; Admin/Auditors have statutory audit permissions
  if (user.id === citizenId || user.role === 'citizen') return null;
  if (user.role === 'admin' || user.role === 'auditor') return null;

  const hasConsent = db.hasActiveConsent(citizenId, user.role, scope);
  if (!hasConsent) {
    db.addAuditLog({
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action_type: 'CONSENT_REVOKED',
      target_id: citizenId,
      metadata: {
        attempted_scope: scope || 'all',
        reason: 'Blocked by server-side consent enforcement',
      },
    });

    return NextResponse.json(
      {
        error: 'Forbidden: Consent Revoked',
        message: `Access denied. Citizen has revoked or not granted consent to role '${user.role}' for scope '${scope || 'general'}'.`,
        complianceViolation: 'NADRA-DPI Consent Clause 4.2',
      },
      { status: 403 }
    );
  }

  return null;
}
