import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { ClubServiceError, listApprovedClubs, submitProposal } from '@/modules/clubs/service';

export async function GET() {
  return NextResponse.json(await listApprovedClubs());
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    return NextResponse.json(await submitProposal(session.user, await request.json()), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ClubServiceError)
      return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Invalid proposal' }, { status: 400 });
  }
}
