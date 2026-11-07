import type { PrismaClient } from '@prisma/client';

import type {
  LandingAnnouncement,
  LandingClub,
  LandingEvent,
  LandingLostItem,
} from '@/modules/landing/types';

const publicClubSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  logoUrl: true,
  _count: { select: { memberships: { where: { status: 'APPROVED' as const } } } },
} as const;

export const landingRepository = {
  async listClubs(db: PrismaClient): Promise<LandingClub[]> {
    const clubs = await db.club.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      take: 8,
      select: publicClubSelect,
    });
    return clubs.map(({ _count, ...club }) => ({ ...club, memberCount: _count.memberships }));
  },

  async listCategories(db: PrismaClient) {
    const categories = await db.club.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    });
    return categories.map((category) => ({ name: category.category, count: category._count.id }));
  },

  listEvents(db: PrismaClient): Promise<LandingEvent[]> {
    return db.event
      .findMany({
        where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
        take: 3,
        select: {
          id: true,
          title: true,
          location: true,
          startsAt: true,
          club: { select: { name: true, slug: true } },
        },
      })
      .then((events) => events);
  },

  listAnnouncements(db: PrismaClient): Promise<LandingAnnouncement[]> {
    return db.announcement.findMany({
      where: { audience: 'UNIVERSITY' },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      select: { id: true, title: true, body: true, createdAt: true },
    });
  },

  listLostItems(db: PrismaClient): Promise<LandingLostItem[]> {
    return db.lostFoundItem
      .findMany({
        where: {
          status: {
            in: ['VERIFIED', 'SEARCHING', 'POSSIBLE_MATCH', 'READY_FOR_COLLECTION'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          reportType: true,
          category: true,
          campusArea: true,
          dateOccurred: true,
        },
      })
      .then((items) => items);
  },

  countActiveClubs(db: PrismaClient) {
    return db.club.count({ where: { status: 'ACTIVE' } });
  },

  countUpcomingEvents(db: PrismaClient) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return db.event.count({
      where: { status: 'PUBLISHED', startsAt: { gte: now, lt: end } },
    });
  },

  countNewAnnouncements(db: PrismaClient) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return db.announcement.count({
      where: { audience: 'UNIVERSITY', createdAt: { gte: since } },
    });
  },

  countOpenLostItems(db: PrismaClient) {
    return db.lostFoundItem.count({
      where: {
        status: { in: ['VERIFIED', 'SEARCHING', 'POSSIBLE_MATCH', 'READY_FOR_COLLECTION'] },
      },
    });
  },
};
