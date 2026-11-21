import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'SahulatRail DPI Public REST API',
      version: '2.0.0',
      description:
        'Official Digital Public Infrastructure (DPI) API for Pakistan Emergency Relief, Mock NADRA Verisys, Raast Disbursal Switch, and Citizen Consent Engine. Engineered by Team Thunder for Coder\'s Cup \'26 AI Hackathon.',
      contact: {
        name: 'Team Thunder Support',
        email: 'thunder@sahulatrail.gov.pk',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://sahulatrail.gov.pk',
        description: 'Simulated Production Gateway',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Live API key issued to provincial partners & departments',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Role-based JWT issued via /api/auth/login or /api/auth/verify-otp',
        },
      },
      schemas: {
        Case: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            citizen_id: { type: 'string' },
            cnic_mock: { type: 'string' },
            status: {
              type: 'string',
              enum: ['draft', 'auto_approved', 'needs_more_proof', 'human_review', 'approved', 'rejected'],
            },
            confidence_score: { type: 'number' },
            citizen_explanation_en: { type: 'string' },
            citizen_explanation_ur: { type: 'string' },
          },
        },
        Consent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            citizen_id: { type: 'string' },
            granted_to_role: { type: 'string', enum: ['citizen', 'helper', 'officer', 'admin', 'auditor'] },
            scope: { type: 'string', enum: ['identity', 'financial', 'documents'] },
            is_active: { type: 'boolean' },
          },
        },
        ScamCheckResult: {
          type: 'object',
          properties: {
            is_scam: { type: 'boolean' },
            confidence: { type: 'number' },
            scam_type: { type: 'string' },
            explanation_simple: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/cases': {
        get: {
          summary: 'List Relief Cases',
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          responses: {
            200: { description: 'List of accessible cases' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Submit Relief Application',
          security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
          responses: {
            200: { description: 'Case evaluated by Asymmetric Risk Router' },
            403: { description: 'Consent Revoked or Forbidden' },
          },
        },
      },
      '/api/cases/{id}/override': {
        post: {
          summary: 'Officer Manual Override (Approve/Reject)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Case decision overridden and logged to audit trail' },
            403: { description: 'Forbidden (Requires Officer or Admin role)' },
          },
        },
      },
      '/api/consents': {
        get: {
          summary: 'See Citizen Consents',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Consent records' } },
        },
        post: {
          summary: 'Share or Revoke Consent',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Consent updated' } },
        },
        put: {
          summary: 'Rectify Misspelled Identity Data (Citizen Rights)',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Data rectified' } },
        },
      },
      '/api/scams/check': {
        post: {
          summary: 'Classify SMS/WhatsApp Message for Relief Fraud',
          responses: {
            200: { description: 'Scam classification with plain language warnings' },
          },
        },
      },
      '/api/mock/nadra': {
        get: {
          summary: 'Query Mock NADRA Registry by CNIC',
          parameters: [{ name: 'cnic', in: 'query', required: false, schema: { type: 'string' } }],
          responses: { 200: { description: 'NADRA citizen profile' } },
        },
      },
      '/api/mock/raast': {
        post: {
          summary: 'Trigger Instant Raast Disbursement',
          responses: { 200: { description: 'Raast ISO-20022 settlement confirmation' } },
        },
      },
      '/api/agents/run': {
        post: {
          summary: 'Execute Autonomous DPI Agent with Tool Calling',
          responses: { 200: { description: 'Autonomous plan and execution trace' } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
