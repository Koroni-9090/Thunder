/**
 * SahulatRail Autonomous DPI Agent with Tool Calling
 * Implements Plan & Execute pattern with real mock tool invocations.
 * Team Thunder | FAST-NUCES Karachi Hackathon
 */

import { db } from './db';
import { evaluateReliefApplication } from './ai-engine';

export interface AgentStep {
  stepNumber: number;
  thought: string;
  tool: string;
  toolInput: any;
  observation: any;
  status: 'SUCCESS' | 'FAILED' | 'ESCALATED';
}

export interface AgentExecutionResult {
  taskId: string;
  goal: string;
  plan: string[];
  steps: AgentStep[];
  finalOutcome: string;
  isEscalatedToHuman: boolean;
  totalLatencyMs: number;
}

export async function runDpiAutonomousAgent(
  goal: string,
  params: { cnic: string; name?: string; income?: number; actorId?: string }
): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  const taskId = `agent-task-${Date.now()}`;
  const steps: AgentStep[] = [];

  const plan = [
    '1. Tool verify_identity: Query mock NADRA registry for CNIC & widow records',
    '2. Tool evaluate_rules: Run Asymmetric Risk Router against active policy thresholds',
    '3. Tool disburse_or_escalate: If approved, trigger Raast payment; if uncertain, escalate to human officer',
    '4. Tool notify_citizen: Dispatch multi-channel notification (SMS / WhatsApp) with plain explanation',
  ];

  let isEscalated = false;
  let finalOutcome = '';

  // STEP 1: Tool calling verify_identity
  const nadraRecord = db.getNadraRecord(params.cnic);
  steps.push({
    stepNumber: 1,
    thought: `Looking up citizen CNIC '${params.cnic}' in mock NADRA registry to retrieve verified records.`,
    tool: 'verify_identity',
    toolInput: { cnic: params.cnic },
    observation: nadraRecord
      ? { found: true, name: nadraRecord.full_name, widow: nadraRecord.is_widow, fraud: nadraRecord.is_flagged_fraud }
      : { found: false, error: 'Record not found in registry' },
    status: 'SUCCESS',
  });

  // STEP 2: Tool calling evaluate_rules
  const activeRule = db.getActiveRuleVersion();
  const decision = await evaluateReliefApplication(
    {
      cnic: params.cnic,
      fullName: params.name || nadraRecord?.full_name || 'Citizen',
      monthlyIncome: params.income || nadraRecord?.monthly_income || 20000,
      isWidow: nadraRecord?.is_widow !== undefined ? nadraRecord.is_widow : true,
    },
    nadraRecord,
    activeRule
  );

  steps.push({
    stepNumber: 2,
    thought: `Evaluating eligibility using Asymmetric Risk Router. Confidence: ${(decision.confidence * 100).toFixed(0)}%. Status: ${decision.status}`,
    tool: 'evaluate_rules',
    toolInput: { rule_version: activeRule.id, thresholds: { auto: activeRule.auto_approve_threshold, handoff: activeRule.human_handoff_threshold } },
    observation: {
      status: decision.status,
      confidence: decision.confidence,
      uncertainty: decision.auditor_trace.asymmetricRiskFlags.join(', ') || 'Clear',
    },
    status: decision.status === 'rejected' ? 'FAILED' : 'SUCCESS',
  });

  // STEP 3: Tool calling disburse_or_escalate
  if (decision.status === 'auto_approved') {
    const payment = {
      id: `pay-${Date.now()}`,
      case_id: `case-agent-${Date.now()}`,
      citizen_cnic: params.cnic,
      amount_pkr: 14000,
      status: 'SETTLED' as const,
      raast_ref: `RAAST-AGENT-${Math.floor(1000000 + Math.random() * 9000000)}`,
      created_at: new Date().toISOString(),
    };
    db.dispatchWebhookEvent('payment.disbursed', payment);

    steps.push({
      stepNumber: 3,
      thought: `High confidence approval met. Calling Raast payment gateway to settle PKR 14,000 grant.`,
      tool: 'disburse_raast',
      toolInput: { cnic: params.cnic, amount: 14000 },
      observation: { settled: true, raast_ref: payment.raast_ref, amount_pkr: 14000 },
      status: 'SUCCESS',
    });
    finalOutcome = `Relief grant auto-approved. Funds disbursed via Raast Reference ${payment.raast_ref}.`;
  } else if (decision.status === 'human_review') {
    isEscalated = true;
    steps.push({
      stepNumber: 3,
      thought: `Confidence score (${(decision.confidence * 100).toFixed(0)}%) is below auto-approval threshold. Escalating to Verification Officer with reason notes.`,
      tool: 'escalate_human_officer',
      toolInput: { reason: decision.auditor_trace.asymmetricRiskFlags.join(', ') || 'Uncertainty flagged', cnic: params.cnic },
      observation: { escalated: true, assigned_queue: 'Lowest Confidence First (Officer Desk)' },
      status: 'ESCALATED',
    });
    finalOutcome = `AI was not sure (${(decision.confidence * 100).toFixed(0)}% confidence). Safely escalated to Human Verification Officer.`;
  } else {
    finalOutcome = `Claim evaluated as ${decision.status}. ${decision.citizen_explanation_en}`;
  }

  // STEP 4: Tool calling notify_citizen
  db.notifications.unshift({
    id: `notif-agent-${Date.now()}`,
    userId: params.actorId || 'usr-citizen-1',
    channel: 'sms',
    title: 'Agent Workflow Completed',
    body: `SahulatRail Agent: ${finalOutcome}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  steps.push({
    stepNumber: 4,
    thought: `Dispatching SMS notification via official short-code 8171 with plain language explanation.`,
    tool: 'send_notification',
    toolInput: { channel: 'sms', recipient: params.cnic },
    observation: { sent: true, shortcode: '8171' },
    status: 'SUCCESS',
  });

  // Log entire autonomous agent workflow execution in immutable audit logs
  db.createAuditLog({
    id: `log-agent-${Date.now()}`,
    actor_id: 'dpi-autonomous-agent',
    actor_role: 'system',
    action_type: 'AGENT_EXECUTION',
    target_id: taskId,
    metadata: {
      goal,
      steps_count: steps.length,
      finalOutcome,
      isEscalated,
      latencyMs: Date.now() - startTime,
    },
    timestamp: new Date().toISOString(),
  });

  return {
    taskId,
    goal,
    plan,
    steps,
    finalOutcome,
    isEscalatedToHuman: isEscalated,
    totalLatencyMs: Date.now() - startTime,
  };
}
