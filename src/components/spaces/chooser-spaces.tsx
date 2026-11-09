'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { UserSpace } from '@/modules/spaces';

export function ChooserSpaces({ spaces }: { spaces: UserSpace[] }) {
  const [remember, setRemember] = useState(false);

  async function rememberChoice(spaceId: string) {
    if (!remember) return;
    await fetch('/api/spaces/remember', {
      body: JSON.stringify({ spaceId, remember: true }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  }

  return (
    <>
      <div className="choose-space-grid">
        {spaces.map((space) => (
          <Link
            aria-disabled={!space.href}
            className={`choose-card${!space.href ? ' disabled' : ''}`}
            href={space.href ?? '#'}
            key={space.id}
            onClick={(event) => {
              if (!space.href) event.preventDefault();
              void rememberChoice(space.id);
            }}
          >
            <span className="choose-card-top">
              <span className="choose-card-icon">{space.club?.name.charAt(0) ?? 'C'}</span>
              <span className="choose-card-role">{space.label}</span>
            </span>
            <strong>{space.club?.name ?? space.label}</strong>
            <small>
              {space.club
                ? `${space.club.memberCount} members`
                : (space.disabledReason ?? 'Your ClubsHub space')}
            </small>
            {space.attentionCount > 0 ? (
              <span className="choose-attention">{space.attentionCount} requests waiting</span>
            ) : null}
          </Link>
        ))}
      </div>
      <label className="choose-remember">
        <input
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          type="checkbox"
        />
        Remember my choice on this device
      </label>
    </>
  );
}
