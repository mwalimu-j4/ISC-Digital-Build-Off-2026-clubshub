import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { LostFoundServiceError, recordHandover, reviewClaim, submitClaim } from '@/modules/lost-found/service';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const claim = await submitClaim(session.user, id, body);
    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();

  try {
    if (body.action === 'review') {
      await reviewClaim(session.user, body.claimId, { decision: body.decision, reason: body.reason });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'handover') {
      await recordHandover(session.user, body.claimId, body.notes);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
