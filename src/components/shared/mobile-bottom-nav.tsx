'use client';

import { Home, Package, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/clubs', icon: Users, label: 'Clubs' },
  { href: '/lost-found', icon: Package, label: 'Lost & Found' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile bottom navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mobile-bottom-nav-item',
              isActive && 'mobile-bottom-nav-item-active'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="mobile-bottom-nav-icon" aria-hidden="true" />
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
