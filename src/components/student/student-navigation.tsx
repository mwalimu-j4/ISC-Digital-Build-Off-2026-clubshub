import { Bell, CalendarDays, Compass, Home, Megaphone, UserRound, Users } from 'lucide-react';
import Link from 'next/link';

const items = [
  { href: '/student', label: 'Home', icon: Home },
  { href: '/student/clubs', label: 'Discover clubs', icon: Compass },
  { href: '/student/events', label: 'Events', icon: CalendarDays },
  { href: '/student/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/student/clubs/mine', label: 'My clubs', icon: Users },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student', label: 'Profile', icon: UserRound },
];

export function StudentSidebar() {
  return (
    <aside className="student-sidebar hidden min-h-screen w-64 shrink-0 border-r px-4 py-6 lg:block">
      <Link
        href="/student"
        className="student-brand mb-8 flex items-center gap-2 px-3 text-lg font-semibold"
      >
        <span className="student-brand-mark flex size-8 items-center justify-center">C</span>
        ClubsHub
      </Link>
      <nav aria-label="Student navigation" className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="student-nav-link flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-12">
        <Link
          href="/profile/settings"
          className="student-account-card block rounded-lg p-3 text-sm"
        >
          <span className="block font-medium">Account settings</span>
          <span className="text-xs text-muted-foreground">Update your profile</span>
        </Link>
      </div>
    </aside>
  );
}
