import { describe, expect, it } from 'vitest';

import {
  activityFromHealthScore,
  chooseFeatured,
  parseDiscoveryQuery,
  rankClubs,
} from '@/modules/discovery';
import type { DiscoveryCandidate } from '@/modules/discovery';
import { toDiscoveryCard } from '@/modules/discovery/services/dto';

function candidate(overrides: Partial<DiscoveryCandidate> = {}): DiscoveryCandidate {
  return {
    id: 'club-1',
    name: 'Coding Society',
    slug: 'coding-society',
    description: 'Build projects together.',
    category: 'Technology',
    logoUrl: null,
    verified: true,
    memberCount: 30,
    activity: { label: 'Active', score: 55, dots: 3 },
    interests: [{ id: 'interest-tech', name: 'Technology', slug: 'technology' }],
    nextEvent: null,
    chairperson: null,
    latestPublicEventAt: new Date('2026-11-01T12:00:00.000Z'),
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
    ...overrides,
  };
}

describe('public club discovery', () => {
  it('ranks clubs with interest overlap as the largest score component', () => {
    const exactMatch = candidate({
      id: 'match',
      name: 'Exact match',
      interests: [
        { id: 'tech', name: 'Technology', slug: 'technology' },
        { id: 'leadership', name: 'Leadership', slug: 'leadership' },
      ],
    });
    const partialMatch = candidate({ id: 'partial', name: 'Partial match' });
    const ranked = rankClubs(
      [partialMatch, exactMatch],
      ['technology', 'leadership'],
      new Date('2026-11-10T12:00:00.000Z'),
    );
    expect(ranked[0]!.id).toBe('match');
    expect(ranked[0]!.matchPercent).toBeDefined();
    expect(ranked[0]!.matchingInterests.map((interest) => interest.slug)).toEqual([
      'technology',
      'leadership',
    ]);
  });

  it('uses deterministic name ordering for score ties', () => {
    const second = candidate({ id: 'b', name: 'Beta club' });
    const first = candidate({ id: 'a', name: 'Alpha club' });
    expect(
      rankClubs([second, first], [], new Date('2026-11-10T12:00:00.000Z')).map((club) => club.name),
    ).toEqual(['Alpha club', 'Beta club']);
  });

  it('does not return a match percentage until interests are selected', () => {
    expect(
      rankClubs([candidate()], [], new Date('2026-11-10T12:00:00.000Z'))[0]!,
    ).not.toHaveProperty('matchPercent');
  });

  it('maps the shared health score to accessible activity levels and dots', () => {
    expect(activityFromHealthScore(70)).toEqual({ label: 'Very active', score: 70, dots: 5 });
    expect(activityFromHealthScore(40)).toEqual({ label: 'Active', score: 40, dots: 3 });
    expect(activityFromHealthScore(10)).toEqual({ label: 'Quiet', score: 10, dots: 1 });
    expect(activityFromHealthScore(120).score).toBe(100);
  });

  it('features only reviewed active-level clubs and caps the list at three', () => {
    const activeClub = { verified: true, activity: { label: 'Active' } };
    const veryActiveClub = { verified: true, activity: { label: 'Very active' } };
    const unreviewed = { verified: false, activity: { label: 'Very active' } };
    const quiet = { verified: true, activity: { label: 'Quiet' } };
    expect(
      chooseFeatured([activeClub, veryActiveClub, unreviewed, quiet, activeClub, activeClub], 3),
    ).toHaveLength(3);
    expect(chooseFeatured([unreviewed, quiet])).toEqual([]);
  });

  it('validates shareable filters and interest slugs', () => {
    expect(
      parseDiscoveryQuery({
        interests: 'technology,leadership',
        sort: 'active',
        verified: '1',
        page: '2',
      }),
    ).toMatchObject({
      interests: ['technology', 'leadership'],
      sort: 'active',
      verifiedOnly: true,
      page: 2,
    });
    expect(() => parseDiscoveryQuery({ interests: 'made-up-interest' })).toThrow();
    expect(() => parseDiscoveryQuery({ page: '0' })).toThrow();
  });

  it('whitelists fields in the public club card DTO', () => {
    const ranked = rankClubs(
      [candidate()],
      ['technology'],
      new Date('2026-11-10T12:00:00.000Z'),
    )[0]!;
    const withPrivateFields = { ...ranked, email: 'private@example.test', schoolId: 'private-id' };
    const card = toDiscoveryCard(withPrivateFields, true);
    expect(card).toMatchObject({ id: 'club-1', memberCount: 30, featured: true });
    expect(card).not.toHaveProperty('email');
    expect(card).not.toHaveProperty('schoolId');
    expect(card).not.toHaveProperty('latestPublicEventAt');
    expect(card).not.toHaveProperty('recommendationScore');
  });
});
