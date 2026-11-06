import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { getProfile } from '@/modules/profile';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  const profile = await getProfile(session.user.id, session.user.role, userId);

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
