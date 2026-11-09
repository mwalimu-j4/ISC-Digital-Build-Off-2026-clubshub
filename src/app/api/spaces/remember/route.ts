import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import {
  getSpaceById,
  getUserSpaces,
  REMEMBERED_SPACE_COOKIE,
  REMEMBERED_SPACE_MAX_AGE,
} from '@/modules/spaces';
import { rememberSpaceSchema } from '@/modules/spaces/validations/spaces-schema';

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user)
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const input = rememberSpaceSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: 'Invalid space' }, { status: 400 });
  const spaces = await getUserSpaces(session.user);
  if (!getSpaceById(spaces, input.data.spaceId)) {
    return NextResponse.json({ error: 'Space is not available' }, { status: 403 });
  }
  const store = await cookies();
  if (input.data.remember) {
    store.set(REMEMBERED_SPACE_COOKIE, input.data.spaceId, {
      httpOnly: true,
      maxAge: REMEMBERED_SPACE_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } else {
    store.delete(REMEMBERED_SPACE_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
