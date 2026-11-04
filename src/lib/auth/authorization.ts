import type { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth/session';

export async function requireUser() {
  const session = await getCurrentSession();

  if (!session?.user || session.user.status !== 'ACTIVE') {
    redirect('/sign-in');
  }

  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect('/unauthorized');
  }

  return user;
}
