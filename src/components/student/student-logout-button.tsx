'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function StudentLogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      className="student-logout-button flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {!compact && 'Log out'}
    </button>
  );
}
