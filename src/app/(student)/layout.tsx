import type { ReactNode } from 'react';

import { StudentLogoutButton } from '@/components/student/student-logout-button';
import { StudentSidebar } from '@/components/student/student-navigation';
import { requireRole } from '@/lib/auth/authorization';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole('STUDENT');
  return (
    <div className="student-theme flex min-h-screen bg-background">
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
            <div className="flex items-center gap-2">
              <a href="/profile" className="student-mobile-profile">
                Profile
              </a>
              <StudentLogoutButton compact />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
