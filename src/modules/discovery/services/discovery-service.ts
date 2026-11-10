import type { PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { DISCOVERY_PAGE_SIZE } from '@/modules/discovery/constants';
import { discoveryRepository } from '@/modules/discovery/repositories/discovery-repository';
import { toDiscoveryCard } from '@/modules/discovery/services/dto';
import { chooseFeatured, rankClubs } from '@/modules/discovery/services/ranking';
import type { DiscoveryInterest } from '@/modules/discovery/types';
import type { DiscoveryQuery } from '@/modules/discovery/validations/discovery-schema';

export class DiscoveryServiceError extends Error {}

export async function getUserInterestSlugs(userId: string, db: PrismaClient = prisma) {
  return discoveryRepository.listUserInterestSlugs(db, userId);
}

export async function saveUserInterests(
  userId: string,
  slugs: string[],
  db: PrismaClient = prisma,
) {
  const available = await discoveryRepository.listInterests(db);
  const valid = [...new Set(slugs)];
  if (
    valid.length > 8 ||
    valid.some((slug) => !available.some((interest) => interest.slug === slug))
  ) {
    throw new DiscoveryServiceError('Choose up to eight available interests.');
  }
  await discoveryRepository.replaceUserInterests(db, userId, valid);
}

export async function getClubInterestSettings(
  userId: string,
  slug: string,
  db: PrismaClient = prisma,
) {
  const [club, interests] = await Promise.all([
    discoveryRepository.getClubInterestSettings(db, userId, slug),
    discoveryRepository.listInterests(db),
  ]);
  if (!club) throw new DiscoveryServiceError('Approved club-admin access is required.');
  return { ...club, interests };
}

export async function saveClubInterests(
  userId: string,
  slug: string,
  interestIds: string[],
  db: PrismaClient = prisma,
) {
  const club = await discoveryRepository.getClubInterestSettings(db, userId, slug);
  if (!club) throw new DiscoveryServiceError('Approved club-admin access is required.');
  const interests = await discoveryRepository.listInterests(db);
  const uniqueIds = [...new Set(interestIds)];
  if (
    uniqueIds.length < 1 ||
    uniqueIds.length > 5 ||
    uniqueIds.some((id) => !interests.some((interest) => interest.id === id))
  ) {
    throw new DiscoveryServiceError('Select between one and five club interests.');
  }
  await discoveryRepository.replaceClubInterests(db, club.id, uniqueIds);
}

function sortCandidates<
  T extends {
    recommendationScore: number;
    activity: { score: number };
    createdAt: Date;
    name: string;
  },
>(candidates: T[], sort: DiscoveryQuery['sort']) {
  if (sort === 'active') {
    return [...candidates].sort(
      (a, b) =>
        b.activity.score - a.activity.score ||
        b.recommendationScore - a.recommendationScore ||
        a.name.localeCompare(b.name),
    );
  }
  if (sort === 'newest') {
    return [...candidates].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.name.localeCompare(b.name),
    );
  }
  return candidates;
}

export async function getDiscoveryResult(query: DiscoveryQuery, db: PrismaClient = prisma) {
  const [{ candidates, categories }, interests] = await Promise.all([
    discoveryRepository.listDiscoveryCandidates(db, query),
    discoveryRepository.listInterests(db),
  ]);
  const effectiveSort = !query.interests.length && query.sort === 'match' ? 'active' : query.sort;
  const ranked = rankClubs(candidates, query.interests);
  const ordered = sortCandidates(ranked, effectiveSort);
  const featuredCandidates = query.page === 1 ? chooseFeatured(ranked, 3) : [];
  const featuredIds = new Set(featuredCandidates.map((club) => club.id));
  const pageCandidates = ordered.slice(
    (query.page - 1) * DISCOVERY_PAGE_SIZE,
    query.page * DISCOVERY_PAGE_SIZE,
  );
  const featured = featuredCandidates.map((club) =>
    toDiscoveryCard(club, featuredIds.has(club.id)),
  );
  const clubs = pageCandidates
    .filter((club) => !featuredIds.has(club.id))
    .map((club) => toDiscoveryCard(club, featuredIds.has(club.id)));
  const selectedInterests = query.interests;
  const selectedInterestNames = new Set<string>(selectedInterests);
  const selected = interests.filter((interest: DiscoveryInterest) =>
    selectedInterestNames.has(interest.slug),
  );

  return {
    interests,
    selectedInterests: selected.map((interest) => interest.slug),
    categories,
    featured,
    clubs,
    total: ordered.length,
    page: query.page,
    pageSize: DISCOVERY_PAGE_SIZE,
  };
}
