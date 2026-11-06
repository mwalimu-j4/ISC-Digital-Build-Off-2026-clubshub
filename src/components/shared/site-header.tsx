'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { NotificationBell } from '@/components/lost-found/notification-bell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { href: '/clubs', label: 'Discover clubs' },
  { href: '/dashboard/clubs', label: 'My clubs' },
  { href: '/lost-found', label: 'Lost & Found' },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated';
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN';

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link className="brand" href="/" aria-label="ClubsHub home">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>ClubsHub</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {isSignedIn && <NotificationBell />}
          {status === 'loading' ? (
            <span className="header-account-loading" aria-label="Loading account" />
          ) : isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="header-avatar-button" aria-label="Account menu">
                  <Avatar size="default">
                    <AvatarFallback>
                      {(session.user.name ?? session.user.email ?? 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span className="font-semibold">{session.user.name ?? session.user.email}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {session.user.email}
                  </span>
                  {session.user.role !== 'STUDENT' && (
                    <Badge variant="secondary" className="mt-1 w-fit">
                      {session.user.role === 'SUPER_ADMIN'
                        ? 'Admin'
                        : session.user.role === 'RECOVERY_OFFICER'
                          ? 'Recovery Officer'
                          : session.user.role}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/clubs">My Clubs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/settings">Account Settings</Link>
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/clubs">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  variant="destructive"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link className="button button-primary header-join" href="/sign-in">
              Log in
            </Link>
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
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {isSuperAdmin ? (
              <Link href="/admin/clubs" onClick={() => setIsMenuOpen(false)}>
                Admin review
              </Link>
            ) : null}
            {isSignedIn ? (
              <>
                <Link href="/notifications" onClick={() => setIsMenuOpen(false)}>
                  Notifications
                </Link>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  My profile
                </Link>
                <Link href="/profile/settings" onClick={() => setIsMenuOpen(false)}>
                  Account settings
                </Link>
                <button
                  className="mobile-nav-logout"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  type="button"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                Log in
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
