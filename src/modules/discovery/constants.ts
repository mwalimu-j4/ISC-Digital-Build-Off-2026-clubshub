export const DISCOVERY_PAGE_SIZE = 12;

export const DISCOVERY_SCORE_WEIGHTS = {
  interests: 60,
  activity: 20,
  verified: 8,
  eventRecency: 8,
  members: 4,
} as const;

export const INTEREST_COOKIE = 'club-discovery-interests';

export const DISCOVERY_INTEREST_SLUGS = [
  'technology',
  'business',
  'sports',
  'music',
  'leadership',
  'community-service',
  'arts',
  'academic',
] as const;
