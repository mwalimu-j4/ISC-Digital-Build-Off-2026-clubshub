import { prisma } from '@/lib/database/prisma';
import { type DiscoveryQuery, getDiscoveryResult, parseDiscoveryQuery } from '@/modules/discovery';
import { landingRepository } from '@/modules/landing/repositories/landing-repository';
import type { LandingData } from '@/modules/landing/types';

async function optional<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query();
  } catch {
    return null;
  }
}

export async function getLandingData(
  query: DiscoveryQuery = parseDiscoveryQuery({}),
): Promise<LandingData> {
  const [
    discovery,
    events,
    announcements,
    lostItems,
    activeClubs,
    upcomingEvents,
    newAnnouncements,
    openLostItems,
  ] = await Promise.all([
    getDiscoveryResult(query),
    optional(() => landingRepository.listEvents(prisma)),
    optional(() => landingRepository.listAnnouncements(prisma)),
    optional(() => landingRepository.listLostItems(prisma)),
    optional(() => landingRepository.countActiveClubs(prisma)),
    optional(() => landingRepository.countUpcomingEvents(prisma)),
    optional(() => landingRepository.countNewAnnouncements(prisma)),
    optional(() => landingRepository.countOpenLostItems(prisma)),
  ]);

  return {
    categories: discovery.categories,
    clubs: [...discovery.featured, ...discovery.clubs].map((club) => ({
      id: club.id,
      name: club.name,
      slug: club.slug,
      category: club.category,
      logoUrl: club.logoUrl,
      memberCount: club.memberCount,
    })),
    events: events ?? [],
    announcements: announcements ?? [],
    lostItems: lostItems ?? [],
    discovery,
    stats: { activeClubs, upcomingEvents, newAnnouncements, openLostItems },
  };
}
