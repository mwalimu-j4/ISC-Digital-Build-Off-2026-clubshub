import Image from 'next/image';
import type { ReactNode } from 'react';

import type { ClubActivity, DiscoveryClubCard, DiscoveryInterest } from '@/modules/discovery';

export type ClubCardRow = {
  label: string;
  value: string;
  muted?: boolean;
};

export type ClubCardDetails = {
  featured?: boolean;
  verified?: boolean;
  activity?: ClubActivity;
  matchPercent?: number;
  matchingInterests?: DiscoveryInterest[];
};

export function formatClubMemberCount(count: number) {
  return `${count} ${count === 1 ? 'member' : 'members'}`;
}

export function ClubCard({
  club,
  details,
  rows,
  actions,
}: {
  club: Pick<
    DiscoveryClubCard,
    'name' | 'slug' | 'description' | 'category' | 'logoUrl' | 'memberCount'
  >;
  details?: ClubCardDetails;
  rows: readonly [ClubCardRow, ClubCardRow];
  actions: ReactNode;
}) {
  const description = club.description?.trim() || 'This club has not added a description yet.';
  const activity = details?.activity;

  return (
    <article className="discovery-club-card">
      <div aria-hidden="true" className="discovery-card-banner" />
      <div className="discovery-card-badges">
        {details?.featured ? (
          <span className="discovery-badge discovery-badge-featured">Featured</span>
        ) : null}
        {details?.verified ? (
          <span className="discovery-badge discovery-badge-verified">
            <span aria-hidden="true">✓</span> Verified
          </span>
        ) : null}
      </div>
      <div className="discovery-card-content">
        <div className="discovery-card-title-row">
          <div className="discovery-club-logo">
            {club.logoUrl ? (
              <Image alt="" height={52} src={club.logoUrl} width={52} />
            ) : (
              club.name.charAt(0).toUpperCase()
            )}
          </div>
          {details?.matchPercent !== undefined ? (
            <span className="discovery-match-score">
              <strong>{details.matchPercent}%</strong> match
            </span>
          ) : null}
        </div>
        <h3 title={club.name}>{club.name}</h3>
        <p className="discovery-club-category">{club.category}</p>
        <div
          aria-label={activity ? `Activity: ${activity.label}` : undefined}
          className={`discovery-activity${activity ? '' : ' discovery-activity-count-only'}`}
        >
          {activity ? (
            <>
              <span aria-hidden="true" className="discovery-activity-dots">
                {Array.from({ length: 5 }, (_, index) => (
                  <i className={index < activity.dots ? 'on' : ''} key={index} />
                ))}
              </span>
              <strong>{activity.label}</strong>
            </>
          ) : null}
          <span className="discovery-member-count">{formatClubMemberCount(club.memberCount)}</span>
        </div>
        <p className="discovery-club-description">{description}</p>
        <div aria-label="Matching interests" className="discovery-matching-interests">
          {details?.matchingInterests?.map((interest) => (
            <span key={interest.id}>{interest.name}</span>
          ))}
        </div>
        <div className="discovery-card-meta">
          {rows.map((row) => (
            <p
              className={row.muted ? 'muted' : ''}
              key={row.label}
              title={`${row.label}: ${row.value}`}
            >
              <strong>{row.label}:</strong> <span>{row.value}</span>
            </p>
          ))}
        </div>
        <div className="discovery-card-actions">{actions}</div>
      </div>
    </article>
  );
}
