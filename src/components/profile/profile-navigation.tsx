'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/profile', label: 'Overview' },
  { href: '/profile/clubs', label: 'My Clubs' },
  { href: '/profile/activity', label: 'Activity' },
  { href: '/profile/settings', label: 'Settings' },
];

function isActivePath(pathname: string, href: string) {
  return href === '/profile' ? pathname === href : pathname.startsWith(href);
}

export function ProfileNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <nav className="sticky top-20 space-y-1" aria-label="Profile sections">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 lg:hidden">
        <nav
          className="flex gap-2 overflow-x-auto border-b border-border pb-2"
          aria-label="Profile sections"
        >
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
