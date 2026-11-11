import type { ReactNode } from 'react';

import { BackButton } from '@/components/shared/back-button';
import {
  StudentMobileHeader,
  StudentSidebar,
  StudentTopBar,
} from '@/components/student/student-navigation';
import { requireRole } from '@/lib/auth/authorization';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole('STUDENT');
  return (
    <div className="student-theme flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="min-w-0 flex-1">
        <StudentMobileHeader />
        <StudentTopBar />
        <main className="mx-auto max-w-[1240px] px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-10 lg:pb-10">
          <BackButton fallbackHref="/student" />
          {children}
        </main>
        <footer className="student-footer">
          © {new Date().getFullYear()} University of Eastern Africa, Baraton. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
