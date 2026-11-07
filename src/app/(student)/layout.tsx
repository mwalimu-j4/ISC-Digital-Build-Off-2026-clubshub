import type { ReactNode } from 'react';

import { StudentSidebar } from '@/components/student/student-navigation';
import { requireRole } from '@/lib/auth/authorization';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole('STUDENT');
  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="min-w-0 flex-1">
        <header className="border-b border-border bg-card px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="font-semibold">Student dashboard</span>
            <a href="/profile" className="text-sm text-muted-foreground">
              Profile
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
