import Link from 'next/link';

type AdminShellProps = {
  children: React.ReactNode;
  pendingCount?: number;
  userName?: string | null;
};

const navigation = [
  { href: '/super-admin', label: 'Overview', icon: '⌂' },
  { href: '/super-admin/approvals', label: 'Club approvals', icon: '✓' },
  { href: '/clubs', label: 'Clubs', icon: '◈' },
  { href: '/super-admin/users', label: 'Users and roles', icon: '◎' },
  { href: '/admin/clubs', label: 'Moderation', icon: '!' },
  { href: '/super-admin#analytics', label: 'Analytics', icon: '▥' },
  { href: '/super-admin#audit', label: 'Audit logs', icon: '≡' },
  { href: '/super-admin#settings', label: 'Settings', icon: '⚙' },
];

export function AdminShell({ children, pendingCount = 0, userName }: AdminShellProps) {
  return (
    <div className="admin-theme admin-layout">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/super-admin">
          <span className="admin-brand-mark">C</span>
          <span>ClubsHub</span>
        </Link>
        <p className="admin-role">Super admin</p>
        <nav className="admin-nav" aria-label="Super admin navigation">
          {navigation.map((item) => (
            <Link
              className={`admin-nav-link${item.label === 'Users and roles' ? ' admin-nav-link-active' : ''}`}
              href={item.href}
              key={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.label === 'Club approvals' && pendingCount > 0 ? (
                <b className="admin-nav-count">{pendingCount}</b>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <strong>{userName ?? 'Super admin'}</strong>
          <span>Super admin</span>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
