import type { PrismaClient } from '@prisma/client';

export type ClubAdminOverviewDb = PrismaClient;

export const clubAdminOverviewRepository = {
  findAdminClubs(db: ClubAdminOverviewDb, userId: string) {
    return db.club.findMany({
      where: {
        status: 'ACTIVE',
        memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } },
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, category: true },
    });
  },

  findClubForAdmin(db: ClubAdminOverviewDb, userId: string, slug: string) {
    return db.club.findFirst({
      where: {
        slug,
        memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        status: true,
        logoUrl: true,
        memberships: {
          where: { status: 'APPROVED' },
          select: { approvedAt: true },
          orderBy: { approvedAt: 'desc' },
        },
        events: {
          where: { status: { in: ['PUBLISHED', 'DRAFT'] } },
          orderBy: { startsAt: 'asc' },
          take: 5,
          select: {
            id: true,
            title: true,
            startsAt: true,
            status: true,
            capacity: true,
            _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
          },
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { id: true, title: true, createdAt: true, audience: true },
        },
        _count: {
          select: {
            memberships: { where: { status: 'PENDING' } },
            events: { where: { status: 'PUBLISHED', startsAt: { gte: new Date() } } },
          },
        },
      },
    });
  },

  findRecentActivity(db: ClubAdminOverviewDb, clubId: string) {
    return db.auditLog.findMany({
      where: { targetEntity: 'Club', targetEntityId: clubId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        action: true,
        createdAt: true,
        actor: { select: { fullName: true } },
      },
    });
  },
};
