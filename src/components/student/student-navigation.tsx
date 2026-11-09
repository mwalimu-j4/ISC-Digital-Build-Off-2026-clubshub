import {
  Bell,
  CalendarDays,
  Compass,
  Home,
  Megaphone,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { SpaceSwitcher } from '@/components/spaces/space-switcher';
import { StudentLogoutButton } from '@/components/student/student-logout-button';
import { requireRole } from '@/lib/auth/authorization';
import { getUnreadNotificationCount } from '@/modules/notifications';
import { getUserSpaces } from '@/modules/spaces';

const items = [
  { href: '/student', label: 'Home', icon: Home },
  { href: '/student/clubs', label: 'Discover clubs', icon: Compass },
  { href: '/student/events', label: 'Events', icon: CalendarDays },
  { href: '/student/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/student/clubs/mine', label: 'My clubs', icon: Users },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export async function StudentSidebar() {
  const user = await requireRole('STUDENT');
  const unread = await getUnreadNotificationCount(user);
  const spaces = await getUserSpaces(user);
  return (
    <aside className="student-sidebar hidden min-h-screen w-[244px] shrink-0 border-r px-4 py-6 lg:flex lg:flex-col">
      <Link
        href="/student"
        className="student-brand mb-8 flex items-center gap-2 px-2 text-lg font-semibold"
      >
        <span className="student-brand-mark flex size-8 items-center justify-center">C</span>
        ClubsHub
      </Link>
      <div className="mt-2">
        <SpaceSwitcher compact spaces={spaces} />
      </div>
      <nav aria-label="Student navigation" className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="student-nav-link flex min-h-11 items-center gap-3 rounded-full px-3 text-sm transition-colors"
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && unread > 0 && (
              <span className="student-unread-badge">{unread}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <Link
          href="/profile/settings"
          className="student-account-card flex items-center gap-3 rounded-xl p-3 text-sm"
        >
          <span className="student-avatar">S</span>
          <span>
            <strong className="block">Student account</strong>
            <small>Student · Settings</small>
          </span>
        </Link>
        <StudentLogoutButton />
      </div>
    </aside>
  );
}

export function StudentMobileHeader() {
  return (
    <header className="student-mobile-header lg:hidden">
      <Link href="/student" className="student-mobile-brand">
        <span className="student-brand-mark">C</span>
        <strong>ClubsHub</strong>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/student/notifications"
          className="student-icon-button"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Link>
        <details className="relative">
          <summary className="student-avatar cursor-pointer list-none">S</summary>
          <div className="student-menu">
            <Link href="/profile/settings">Settings</Link>
            <StudentLogoutButton />
          </div>
        </details>
      </div>
    </header>
  );
}

export function StudentTopBar() {
  return (
    <div className="student-topbar">
      <form action="/student" method="get" className="student-search">
        <Search className="size-4" aria-hidden="true" />
        <input
          name="q"
          placeholder="Search clubs, events, announcements"
          aria-label="Search clubs, events, announcements"
        />
        <kbd>Ctrl K</kbd>
      </form>
      <Link href="/clubs/propose" className="student-propose-button">
        + Propose a club
      </Link>
    </div>
  );
}
