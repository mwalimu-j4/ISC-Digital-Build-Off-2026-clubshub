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

export const FALLBACK_DISCOVERY_INTERESTS = [
  { id: 'technology', name: 'Technology', slug: 'technology' },
  { id: 'business', name: 'Business', slug: 'business' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'music', name: 'Music', slug: 'music' },
  { id: 'leadership', name: 'Leadership', slug: 'leadership' },
  { id: 'community-service', name: 'Community service', slug: 'community-service' },
  { id: 'arts', name: 'Arts', slug: 'arts' },
  { id: 'academic', name: 'Academic', slug: 'academic' },
] as const;
