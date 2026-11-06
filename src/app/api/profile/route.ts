import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { updateProfile, updateProfileSchema } from '@/modules/profile';

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updatedProfile = await updateProfile(
      { id: session.user.id, role: session.user.role },
      data,
    );

    return NextResponse.json(updatedProfile);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
