import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { ProfileNavigation } from '@/components/profile/profile-navigation';
import { StudentSidebar } from '@/components/student/student-navigation';
import { getCurrentSession } from '@/lib/auth/session';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.status !== 'ACTIVE') {
    redirect('/sign-in');
  }

  if (session.user.role === 'STUDENT') {
    return (
      <div className="student-theme student-profile-shell flex min-h-screen bg-background">
        <StudentSidebar />
        <div className="min-w-0 flex-1">
          <header className="border-b border-border bg-card px-4 py-4 lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <a href="/student" className="student-mobile-brand">
                <span className="student-brand-mark" aria-hidden="true">
                  C
                </span>
                <span>ClubsHub</span>
              </a>
              <a href="/student" className="student-mobile-profile">
                Dashboard
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    );
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
