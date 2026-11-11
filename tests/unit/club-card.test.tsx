import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ClubCard, formatClubMemberCount } from '@/components/clubs/club-card';
import type { DiscoveryClubCard } from '@/modules/discovery';

const club: DiscoveryClubCard = {
  id: 'coding-society',
  name: 'Coding Society',
  slug: 'coding-society',
  description: 'Build projects and learn together.',
  category: 'Technology',
  logoUrl: null,
  verified: true,
  memberCount: 12,
  activity: { label: 'Active', score: 55, dots: 3 },
  interests: [],
  matchingInterests: [{ id: 'technology', name: 'Technology', slug: 'technology' }],
  matchPercent: 88,
  featured: true,
  nextEvent: null,
  chairperson: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('shared club card', () => {
  it('formats member totals without losing singular and empty cases', () => {
    expect(formatClubMemberCount(0)).toBe('0 members');
    expect(formatClubMemberCount(1)).toBe('1 member');
    expect(formatClubMemberCount(24)).toBe('24 members');
  });

  it('renders a populated discovery card with shared sections', () => {
    render(
      <ClubCard
        club={club}
        details={club}
        rows={[
          { label: 'Next', value: 'No upcoming public event' },
          { label: 'Led by', value: 'Leadership not listed yet', muted: true },
        ]}
        actions={<button type="button">Join club</button>}
      />,
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coding Society' })).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('12 members')).toBeInTheDocument();
    expect(screen.getAllByText('Technology')).toHaveLength(2);
    expect(screen.getByText('Next:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join club' })).toBeInTheDocument();
  });

  it('keeps the card structure when optional discovery data is unavailable', () => {
    render(
      <ClubCard
        club={{ ...club, description: '', memberCount: 0 }}
        rows={[
          { label: 'Membership', value: 'Request pending' },
          { label: 'Club status', value: 'Active' },
        ]}
        actions={<button type="button">View club</button>}
      />,
    );

    expect(screen.getByText('This club has not added a description yet.')).toBeInTheDocument();
    expect(screen.getByText('0 members')).toBeInTheDocument();
    expect(screen.getByText('Membership:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View club' })).toBeInTheDocument();
  });
});
