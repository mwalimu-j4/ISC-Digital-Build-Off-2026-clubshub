import { Bell, CalendarDays, Compass, Home, Megaphone, UserRound, Users } from 'lucide-react';
import Link from 'next/link';

const items = [
  { href: '/student', label: 'Home', icon: Home },
  { href: '/student/clubs', label: 'Discover clubs', icon: Compass },
  { href: '/student/events', label: 'Events', icon: CalendarDays },
  { href: '/student/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/student/clubs/mine', label: 'My clubs', icon: Users },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function StudentSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-card px-4 py-6 lg:block">
      <Link href="/student" className="mb-8 flex items-center gap-2 px-3 text-lg font-semibold">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          C
        </span>
        ClubsHub
      </Link>
      <nav aria-label="Student navigation" className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-12">
        <Link
          href="/profile/settings"
          className="block rounded-lg border border-border bg-background p-3 text-sm"
        >
          <span className="block font-medium">Account settings</span>
          <span className="text-xs text-muted-foreground">Update your profile</span>
        </Link>
      </div>
    </aside>
  );
}
