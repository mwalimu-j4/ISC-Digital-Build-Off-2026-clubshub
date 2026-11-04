import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { ClubServiceError, reviewProposal } from '@/modules/clubs/service';

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  const session = await getCurrentSession();
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { clubId } = await params;
    return NextResponse.json(await reviewProposal(session.user, clubId, await request.json()));
  } catch (error) {
    if (error instanceof ClubServiceError)
      return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Invalid review' }, { status: 400 });
  }
}
