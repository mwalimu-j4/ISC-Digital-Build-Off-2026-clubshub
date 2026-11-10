import type { PrismaClient } from '@prisma/client';

import { listPublicCategories } from '@/modules/clubs';
import type { LandingAnnouncement, LandingEvent, LandingLostItem } from '@/modules/landing/types';

export const landingRepository = {
  async listCategories(db: PrismaClient) {
    return listPublicCategories(db);
  },

  listEvents(db: PrismaClient): Promise<LandingEvent[]> {
    return db.event
      .findMany({
        where: { status: 'PUBLISHED', startsAt: { gte: new Date() }, club: { status: 'ACTIVE' } },
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
      where: { status: 'PUBLISHED', startsAt: { gte: now, lt: end }, club: { status: 'ACTIVE' } },
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
