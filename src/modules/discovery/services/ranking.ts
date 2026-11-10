import { DISCOVERY_SCORE_WEIGHTS } from '@/modules/discovery/constants';
import type { DiscoveryCandidate, RankedDiscoveryClub } from '@/modules/discovery/types';

const DAY_MS = 86_400_000;

/** Stable recommendation score. All inputs are selected by the discovery repository. */
export function rankClubs(
  clubs: DiscoveryCandidate[],
  selectedSlugs: string[],
  now = new Date(),
): RankedDiscoveryClub[] {
  const interests = new Set(selectedSlugs);
  const maxMembers = Math.max(1, ...clubs.map((club) => club.memberCount));

  return clubs
    .map((club) => {
      const matchingInterests = club.interests.filter((interest) => interests.has(interest.slug));
      const interestScore = interests.size ? (matchingInterests.length / interests.size) * 100 : 0;
      const elapsedDays = club.latestPublicEventAt
        ? Math.max(0, (now.getTime() - club.latestPublicEventAt.getTime()) / DAY_MS)
        : Number.POSITIVE_INFINITY;
      const eventScore = Number.isFinite(elapsedDays)
        ? Math.max(0, 100 * (1 - elapsedDays / 90))
        : 0;
      const memberScore = (Math.log1p(club.memberCount) / Math.log1p(maxMembers)) * 100;
      const recommendationScore =
        (interestScore * DISCOVERY_SCORE_WEIGHTS.interests) / 100 +
        (club.activity.score * DISCOVERY_SCORE_WEIGHTS.activity) / 100 +
        (club.verified ? DISCOVERY_SCORE_WEIGHTS.verified : 0) +
        (eventScore * DISCOVERY_SCORE_WEIGHTS.eventRecency) / 100 +
        (memberScore * DISCOVERY_SCORE_WEIGHTS.members) / 100;

      return {
        ...club,
        matchingInterests,
        recommendationScore,
        ...(interests.size ? { matchPercent: Math.round(recommendationScore) } : {}),
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore ||
        a.name.localeCompare(b.name) ||
        a.slug.localeCompare(b.slug),
    );
}

export function chooseFeatured<T extends { verified: boolean; activity: { label: string } }>(
  clubs: T[],
  limit = 3,
) {
  return clubs.filter((club) => club.verified && club.activity.label !== 'Quiet').slice(0, limit);
}
