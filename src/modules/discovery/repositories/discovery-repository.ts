import { Prisma, type PrismaClient } from '@prisma/client';

import { calculateClubHealthScore } from '@/modules/club-admin-overview';
import { listPublicCategories, publicClubSearchWhere } from '@/modules/clubs';
import { activityFromHealthScore } from '@/modules/discovery/activity';
import { DISCOVERY_PAGE_SIZE } from '@/modules/discovery/constants';
import type { DiscoveryCandidate, DiscoveryInterest } from '@/modules/discovery/types';
import type { DiscoveryQuery } from '@/modules/discovery/validations/discovery-schema';

export const discoveryRepository = {
  listInterests(db: PrismaClient): Promise<DiscoveryInterest[]> {
    return db.interest.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true },
    });
  },

  listUserInterestSlugs(db: PrismaClient, userId: string) {
    return db.userInterest
      .findMany({
        where: { userId },
        orderBy: { interest: { sortOrder: 'asc' } },
        select: { interest: { select: { slug: true } } },
      })
      .then((rows) => rows.map((row) => row.interest.slug));
  },

  async replaceUserInterests(db: PrismaClient, userId: string, slugs: string[]) {
    const interests = await db.interest.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });
    return db.$transaction(async (tx) => {
      await tx.userInterest.deleteMany({ where: { userId } });
      if (interests.length) {
        await tx.userInterest.createMany({
          data: interests.map(({ id }) => ({ userId, interestId: id })),
        });
      }
    });
  },

  async getClubInterestSettings(db: PrismaClient, userId: string, slug: string) {
    const club = await db.club.findFirst({
      where: { slug, memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } } },
      select: { id: true, name: true, interests: { select: { interestId: true } } },
    });
    return club
      ? {
          id: club.id,
          name: club.name,
          interestIds: club.interests.map(({ interestId }) => interestId),
        }
      : null;
  },

  async replaceClubInterests(db: PrismaClient, clubId: string, interestIds: string[]) {
    return db.$transaction(async (tx) => {
      await tx.clubInterest.deleteMany({ where: { clubId } });
      if (interestIds.length) {
        await tx.clubInterest.createMany({
          data: interestIds.map((interestId) => ({ clubId, interestId })),
        });
      }
    });
  },

  async listDiscoveryCandidates(db: PrismaClient, query: DiscoveryQuery) {
    const now = new Date();
    const where: Prisma.ClubWhereInput = {
      ...publicClubSearchWhere({ search: query.q, category: query.category }),
      ...(query.verifiedOnly ? { reviewedAt: { not: null } } : {}),
      ...(query.interests.length
        ? {
            interests: { some: { interest: { slug: { in: query.interests } } } },
          }
        : {}),
    };

    const [clubs, categories] = await Promise.all([
      db.club.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          logoUrl: true,
          reviewedAt: true,
          createdAt: true,
          interests: { select: { interest: { select: { id: true, name: true, slug: true } } } },
          memberships: {
            where: {
              status: 'APPROVED',
              officialRole: { contains: 'chairperson', mode: 'insensitive' },
            },
            orderBy: { approvedAt: 'asc' },
            take: 1,
            select: { officialRole: true, user: { select: { fullName: true } } },
          },
          events: {
            where: { status: 'PUBLISHED', startsAt: { gte: now } },
            orderBy: { startsAt: 'asc' },
            take: 1,
            select: { title: true, startsAt: true, location: true },
          },
          _count: {
            select: {
              memberships: { where: { status: 'APPROVED' } },
              events: { where: { status: 'PUBLISHED', startsAt: { gte: now } } },
              announcements: { where: { audience: 'UNIVERSITY' } },
            },
          },
        },
      }),
      listPublicCategories(db),
    ]);

    if (!clubs.length) return { candidates: [] as DiscoveryCandidate[], categories };

    const latestEvents = await db.$queryRaw<Array<{ clubId: string; startsAt: Date }>>(Prisma.sql`
      SELECT DISTINCT ON (e."club_id") e."club_id" AS "clubId", e."starts_at" AS "startsAt"
      FROM "events" e
      INNER JOIN "clubs" c ON c."id" = e."club_id"
      WHERE e."club_id" IN (${Prisma.join(clubs.map((club) => club.id))})
        AND e."status" = 'PUBLISHED'
        AND c."status" = 'ACTIVE'
      ORDER BY e."club_id", e."starts_at" DESC
    `);
    const latestEventByClub = new Map(latestEvents.map((event) => [event.clubId, event.startsAt]));

    return {
      candidates: clubs.map((club) => {
        const memberCount = club._count.memberships;
        const healthScore = calculateClubHealthScore({
          memberCount,
          eventCount: club._count.events,
          announcementCount: Math.min(club._count.announcements, 3),
        });
        const chairperson = club.memberships[0];
        return {
          id: club.id,
          name: club.name,
          slug: club.slug,
          description: club.description,
          category: club.category,
          logoUrl: club.logoUrl,
          verified: club.reviewedAt !== null,
          memberCount,
          activity: activityFromHealthScore(healthScore),
          interests: club.interests.map(({ interest }) => interest),
          nextEvent: club.events[0] ?? null,
          chairperson: chairperson?.officialRole
            ? { name: chairperson.user.fullName, title: chairperson.officialRole }
            : null,
          latestPublicEventAt: latestEventByClub.get(club.id) ?? null,
          createdAt: club.createdAt,
        };
      }),
      categories,
    };
  },

  async listActiveClubsFallback(
    db: PrismaClient,
    query: DiscoveryQuery,
  ): Promise<{
    candidates: DiscoveryCandidate[];
    total: number;
    categories: Array<{ name: string; count: number }>;
  }> {
    const where: Prisma.ClubWhereInput = {
      ...publicClubSearchWhere({ search: query.q, category: query.category }),
      ...(query.verifiedOnly ? { reviewedAt: { not: null } } : {}),
    };
    const [clubs, total, categories] = await Promise.all([
      db.club.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        skip: (query.page - 1) * DISCOVERY_PAGE_SIZE,
        take: DISCOVERY_PAGE_SIZE,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          logoUrl: true,
          createdAt: true,
          _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
        },
      }),
      db.club.count({ where }),
      listPublicCategories(db).catch(() => []),
    ]);

    const candidates: DiscoveryCandidate[] = clubs.map((club) => {
      const memberCount = club._count.memberships;
      const healthScore = calculateClubHealthScore({
        memberCount,
        eventCount: 0,
        announcementCount: 0,
      });
      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        description: club.description,
        category: club.category,
        logoUrl: club.logoUrl,
        verified: true,
        memberCount,
        activity: activityFromHealthScore(healthScore),
        interests: [],
        nextEvent: null,
        chairperson: null,
        latestPublicEventAt: null,
        createdAt: club.createdAt,
      };
    });

    return { total, categories, candidates };
  },
};
