import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { runDpiAutonomousAgent } from '@/lib/agent-runner';

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const { goal, cnic, name, income } = body;

    if (!cnic) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'cnic is required to run autonomous agent workflow' }, { status: 400 });
    }

    const agentGoal = goal || `Process emergency flood relief claim and verify identity for citizen with CNIC ${cnic}`;

    const execution = await runDpiAutonomousAgent(agentGoal, {
      cnic,
      name,
      income: income !== undefined ? Number(income) : undefined,
      actorId: user.id,
    });

    return NextResponse.json({
      success: true,
      execution,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }
}
