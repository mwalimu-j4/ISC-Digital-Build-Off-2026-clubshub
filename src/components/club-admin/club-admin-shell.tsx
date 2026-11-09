import Link from 'next/link';

import { SpaceSwitcher } from '@/components/spaces/space-switcher';
import type { UserSpace } from '@/modules/spaces';

type ClubAdminShellProps = {
  children: React.ReactNode;
  club: { name: string; slug: string };
  userName: string | null;
  pendingRequests: number;
  spaces: UserSpace[];
};

const navigation = [
  { label: 'Overview', suffix: '' },
  { label: 'Join requests', suffix: '/requests' },
  { label: 'Members and roles', suffix: '/members' },
  { label: 'Events and check-in', suffix: '/events' },
  { label: 'Publish studio', suffix: '/publishing' },
  { label: 'Showcase', suffix: '/showcase' },
  { label: 'Polls and roles', suffix: '/polls' },
  { label: 'Certificates', suffix: '/certificates' },
  { label: 'Analytics', suffix: '/analytics' },
  { label: 'Club profile', suffix: '/profile' },
];

export function ClubAdminShell({
  children,
  club,
  userName,
  pendingRequests,
  spaces,
}: ClubAdminShellProps) {
  return (
    <div className="club-admin-theme club-admin-layout">
      <aside className="club-admin-sidebar">
        <Link className="club-admin-brand" href={`/club-admin/${club.slug}`}>
          <span className="club-admin-brand-mark">C</span>
          <span>ClubsHub</span>
        </Link>
        <p className="club-admin-role">Club admin</p>
        <SpaceSwitcher currentSpaceId={`CLUB:${club.slug}`} spaces={spaces} />
        <nav aria-label="Club administration navigation" className="club-admin-nav">
          {navigation.map((item, index) => (
            <Link
              className={`club-admin-nav-link${index === 0 ? ' club-admin-nav-link-active' : ''}`}
              href={`/club-admin/${club.slug}${item.suffix}`}
              key={item.label}
            >
              <span>{item.label}</span>
              {item.label === 'Join requests' && pendingRequests > 0 ? (
                <b>{pendingRequests}</b>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="club-admin-account">
          <strong>{userName ?? 'Club admin'}</strong>
          <span>Club administrator</span>
        </div>
      </aside>
      <main className="club-admin-main">{children}</main>
      <nav aria-label="Mobile club administration navigation" className="club-admin-mobile-nav">
        <Link href={`/club-admin/${club.slug}`}>Home</Link>
        <Link href={`/club-admin/${club.slug}/requests`}>Requests</Link>
        <Link className="club-admin-mobile-publish" href={`/club-admin/${club.slug}/publishing`}>
          +
        </Link>
        <Link href={`/club-admin/${club.slug}/events`}>Events</Link>
        <Link href={`/club-admin/${club.slug}/profile`}>More</Link>
      </nav>
    </div>
  );
}
