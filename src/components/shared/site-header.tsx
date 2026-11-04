'use client';

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
        </nav>

        <div className="header-actions">
          <a className="button button-primary header-join" href="/sign-in">
            Join ClubsHub
          </a>
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
          </div>
        </nav>
      ) : null}
    </header>
  );
}
