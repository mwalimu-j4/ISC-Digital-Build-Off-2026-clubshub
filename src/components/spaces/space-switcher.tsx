'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { SpaceAccountActions } from '@/components/spaces/space-account-actions';
import type { UserSpace } from '@/modules/spaces';

type SpaceSwitcherProps = {
  spaces: UserSpace[];
  currentSpaceId?: string;
  compact?: boolean;
};

function currentSpace(spaces: UserSpace[], pathname: string) {
  return spaces.find(
    (space) => space.href && (pathname === space.href || pathname.startsWith(`${space.href}/`)),
  );
}

function chooserHref(pathname: string) {
  const clubAdminMatch = pathname.match(/^\/club-admin\/([^/]+)/);
  if (clubAdminMatch?.[1]) return `/club-admin/${clubAdminMatch[1]}/spaces`;
  if (pathname.startsWith('/super-admin')) return '/super-admin/spaces';
  return '/student/spaces';
}

function SpaceIcon({ space }: { space: UserSpace }) {
  return space.club?.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" className="space-switcher-logo" src={space.club.logoUrl} />
  ) : (
    <span aria-hidden="true" className="space-switcher-initial">
      {space.club?.name.charAt(0) ?? (space.kind === 'super-admin' ? 'A' : 'S')}
    </span>
  );
}

export function SpaceSwitcher({ spaces, currentSpaceId, compact = false }: SpaceSwitcherProps) {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current =
    spaces.find((space) => space.id === currentSpaceId) ?? currentSpace(spaces, pathname);
  const visible = spaces.filter((space) => {
    const text = `${space.club?.name ?? ''} ${space.label}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });
  const manage = visible.filter((space) => space.kind === 'admin');
  const member = visible.filter((space) => space.kind === 'member');
  const other = visible.filter((space) =>
    ['student', 'super-admin', 'pending', 'suspended'].includes(space.kind),
  );

  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  async function remember(spaceId: string) {
    await fetch('/api/spaces/remember', {
      body: JSON.stringify({ spaceId, remember: true }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  }

  function group(title: string, items: UserSpace[]) {
    if (!items.length) return null;
    return (
      <div className="space-switcher-group">
        <p>{title}</p>
        {items.map((space) => (
          <div
            className={`space-switcher-item${space.id === current?.id ? ' current' : ''}`}
            key={space.id}
          >
            {space.href ? (
              <Link
                href={space.href}
                onClick={() => void remember(space.id)}
                title={space.club?.name ?? space.label}
              >
                <SpaceIcon space={space} />
                <span className="space-switcher-copy">
                  <strong>{space.club?.name ?? space.label}</strong>
                  <small>{space.label}</small>
                </span>
                {space.attentionCount > 0 ? (
                  <b className="space-switcher-attention">{space.attentionCount}</b>
                ) : null}
                {space.id === current?.id ? <span aria-label="Current space">✓</span> : null}
              </Link>
            ) : (
              <span aria-disabled="true" title={space.disabledReason}>
                <SpaceIcon space={space} />
                <span className="space-switcher-copy">
                  <strong>{space.club?.name ?? space.label}</strong>
                  <small>{space.disabledReason ?? space.label}</small>
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-switcher">
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`space-switcher-trigger${compact ? ' compact' : ''}`}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        {current ? <SpaceIcon space={current} /> : null}
        <span>{current?.club?.name ?? current?.label ?? 'Choose a space'}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open ? (
        <div aria-label="Choose a space" className="space-switcher-popover" role="dialog">
          <div className="space-switcher-handle" />
          <label className="space-switcher-search">
            <span className="sr-only">Find a club</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a club"
              value={query}
            />
          </label>
          {group('Manage', manage)}
          {group('Member of', member)}
          {group('Other spaces', other)}
          <div className="space-switcher-footer">
            <Link href={chooserHref(pathname)} onClick={() => setOpen(false)}>
              Switch workspace
            </Link>
            <SpaceAccountActions />
          </div>
        </div>
      ) : null}
    </div>
  );
}
