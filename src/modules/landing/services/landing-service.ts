import { prisma } from '@/lib/database/prisma';
import { landingRepository } from '@/modules/landing/repositories/landing-repository';
import type { LandingData } from '@/modules/landing/types';

async function optional<T>(query: () => Promise<T>): Promise<T | null> {
  try {
    return await query();
  } catch {
    return null;
  }
}

export async function getLandingData(): Promise<LandingData> {
  const [
    categories,
    clubs,
    events,
    announcements,
    lostItems,
    activeClubs,
    upcomingEvents,
    newAnnouncements,
    openLostItems,
  ] = await Promise.all([
    optional(() => landingRepository.listCategories(prisma)),
    optional(() => landingRepository.listClubs(prisma)),
    optional(() => landingRepository.listEvents(prisma)),
    optional(() => landingRepository.listAnnouncements(prisma)),
    optional(() => landingRepository.listLostItems(prisma)),
    optional(() => landingRepository.countActiveClubs(prisma)),
    optional(() => landingRepository.countUpcomingEvents(prisma)),
    optional(() => landingRepository.countNewAnnouncements(prisma)),
    optional(() => landingRepository.countOpenLostItems(prisma)),
  ]);

  return {
    categories: categories ?? [],
    clubs: clubs ?? [],
    events: events ?? [],
    announcements: announcements ?? [],
    lostItems: lostItems ?? [],
    stats: { activeClubs, upcomingEvents, newAnnouncements, openLostItems },
  };
}
