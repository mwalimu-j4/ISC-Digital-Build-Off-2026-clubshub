import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { ProfileNavigation } from '@/components/profile/profile-navigation';
import { getCurrentSession } from '@/lib/auth/session';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.status !== 'ACTIVE') {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <ProfileNavigation />

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
