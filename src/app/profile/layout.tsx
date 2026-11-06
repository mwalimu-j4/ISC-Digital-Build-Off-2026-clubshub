import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getCurrentSession } from '@/lib/auth/session';

interface ProfileNavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function ProfileNavLink({ href, label, isActive }: ProfileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      }`}
    >
      {label}
    </Link>
  );
}

export default async function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.status !== 'ACTIVE') {
    redirect('/sign-in');
  }

  const navItems = [
    { href: '/profile', label: 'Overview' },
    { href: '/profile/clubs', label: 'My Clubs' },
    { href: '/profile/activity', label: 'Activity' },
    { href: '/profile/settings', label: 'Settings' },
    { href: '/profile/security', label: 'Security' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Side Navigation */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <nav className="sticky top-20 space-y-1">
            {navItems.map((item) => (
              <ProfileNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={false} // Will be determined by pathname in client component if needed
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto border-b border-border pb-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
