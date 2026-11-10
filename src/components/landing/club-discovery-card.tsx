import Image from 'next/image';
import Link from 'next/link';

import type { DiscoveryClubCard as DiscoveryClub } from '@/modules/discovery';

export function ClubDiscoveryCard({
  club,
  variant = 'featured',
}: {
  club: DiscoveryClub;
  variant?: 'featured' | 'compact';
}) {
  const clubUrl = `/clubs/${club.slug}`;
  return (
    <article className={`discovery-club-card discovery-club-card-${variant}`}>
      <div aria-hidden="true" className="discovery-card-banner" />
      <div className="discovery-card-badges">
        {club.featured ? (
          <span className="discovery-badge discovery-badge-featured">Featured</span>
        ) : null}
        {club.verified ? (
          <span className="discovery-badge discovery-badge-verified">✓ Verified</span>
        ) : null}
      </div>
      <div className="discovery-card-content">
        <div className="discovery-card-title-row">
          <div className="discovery-club-logo">
            {club.logoUrl ? (
              <Image alt="" height={48} src={club.logoUrl} width={48} />
            ) : (
              club.name.charAt(0).toUpperCase()
            )}
          </div>
          {club.matchPercent !== undefined ? (
            <span className="discovery-match-score">
              <strong>{club.matchPercent}%</strong> match
            </span>
          ) : null}
        </div>
        <h3 title={club.name}>{club.name}</h3>
        <p className="discovery-club-category">{club.category}</p>
        <p aria-label={`Activity: ${club.activity.label}`} className="discovery-activity">
          <span aria-hidden="true" className="discovery-activity-dots">
            {Array.from({ length: 5 }, (_, index) => (
              <i className={index < club.activity.dots ? 'on' : ''} key={index} />
            ))}
          </span>
          <strong>{club.activity.label}</strong>
          <span className="discovery-member-count">
            {club.memberCount} active {club.memberCount === 1 ? 'member' : 'members'}
          </span>
        </p>
        <p className="discovery-club-description">{club.description}</p>
        {club.matchingInterests.length ? (
          <div aria-label="Matching interests" className="discovery-matching-interests">
            {club.matchingInterests.map((interest) => (
              <span key={interest.id}>{interest.name}</span>
            ))}
          </div>
        ) : null}
        <div className="discovery-card-meta">
          <p>
            <strong>Next:</strong>{' '}
            {club.nextEvent ? (
              <>
                <span>{club.nextEvent.title}</span> ·{' '}
                {new Intl.DateTimeFormat('en', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                }).format(club.nextEvent.startsAt)}
              </>
            ) : (
              'No upcoming public event'
            )}
          </p>
          <p>
            <strong>Led by:</strong>{' '}
            {club.chairperson
              ? `${club.chairperson.title} · ${club.chairperson.name}`
              : 'No public chairperson listing'}
          </p>
        </div>
        <div className="discovery-card-actions">
          <Link className="discovery-join-button" href={clubUrl}>
            Join club
          </Link>
          <Link aria-label={`View ${club.name}`} className="discovery-view-button" href={clubUrl}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
