import { activityFromHealthScore } from '@/modules/discovery/activity';
import type { DiscoveryClubCard, RankedDiscoveryClub } from '@/modules/discovery/types';

export function toDiscoveryCard(club: RankedDiscoveryClub, featured = false): DiscoveryClubCard {
  return {
    id: club.id,
    name: club.name,
    slug: club.slug,
    description: club.description,
    category: club.category,
    logoUrl: club.logoUrl,
    verified: club.verified,
    memberCount: club.memberCount,
    activity: activityFromHealthScore(club.activity.score),
    interests: club.interests,
    matchingInterests: club.matchingInterests,
    ...(club.matchPercent === undefined ? {} : { matchPercent: club.matchPercent }),
    featured,
    nextEvent: club.nextEvent,
    chairperson: club.chairperson,
    createdAt: club.createdAt,
  };
}
