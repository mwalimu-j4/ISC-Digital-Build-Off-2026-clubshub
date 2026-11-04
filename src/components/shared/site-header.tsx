'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

const navigation = [
  { href: '/clubs', label: 'Discover clubs' },
  { href: '/clubs/propose', label: 'Propose a club' },
  { href: '/dashboard/clubs', label: 'My clubs' },
  { href: '#events', label: 'Events' },
  { href: '#lost-found', label: 'Lost & Found' },
  { href: '#announcements', label: 'Announcements' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated';
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN';

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <a className="brand" href="#home" aria-label="ClubsHub home">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>ClubsHub</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          {isSuperAdmin ? <a href="/admin/clubs">Admin</a> : null}
        </nav>

        <div className="header-actions">
          {status === 'loading' ? (
            <span className="header-account-loading" aria-label="Loading account" />
          ) : isSignedIn ? (
            <>
              <Link className="header-account" href="/account">
                <span className="header-avatar" aria-hidden="true">
                  {(session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase()}
                </span>
                <span className="header-account-name">
                  {session.user.name ?? session.user.email}
                </span>
              </Link>
              <button
                className="button button-secondary header-logout"
                onClick={() => signOut({ callbackUrl: '/' })}
                type="button"
              >
                Log out
              </button>
            </>
          ) : (
            <a className="button button-primary header-join" href="/sign-in">
              Log in
            </a>
          )}
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
          <div className="site-container mobile-nav-links">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            {isSuperAdmin ? (
              <a href="/admin/clubs" onClick={() => setIsMenuOpen(false)}>
                Admin review
              </a>
            ) : null}
            {isSignedIn ? (
              <>
                <a href="/account" onClick={() => setIsMenuOpen(false)}>
                  My profile
                </a>
                <button
                  className="mobile-nav-logout"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  type="button"
                >
                  Log out
                </button>
              </>
            ) : (
              <a href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                Log in
              </a>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
