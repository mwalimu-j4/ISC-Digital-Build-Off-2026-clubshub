import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { ClubServiceError, setClubSuspension, updateClubProfile } from '@/modules/clubs/service';

type Context = { params: Promise<{ clubId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await getCurrentSession();
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { clubId } = await params;
  const body = (await request.json()) as {
    action?: string;
    suspended?: boolean;
    name?: unknown;
    description?: unknown;
    purpose?: unknown;
    category?: unknown;
    activities?: unknown;
    logoUrl?: unknown;
  };
  try {
    if (body.action === 'suspension')
      return NextResponse.json(
        await setClubSuspension(session.user, clubId, body.suspended === true),
      );
    return NextResponse.json(
      await updateClubProfile(session.user, clubId, {
        name: typeof body.name === 'string' ? body.name : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        purpose: typeof body.purpose === 'string' ? body.purpose : undefined,
        category: typeof body.category === 'string' ? body.category : undefined,
        activities: Array.isArray(body.activities)
          ? body.activities.filter((item): item is string => typeof item === 'string')
          : undefined,
        logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl : undefined,
      }),
    );
  } catch (error) {
    if (error instanceof ClubServiceError)
      return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: 'Invalid club update' }, { status: 400 });
  }
}
