import type { PrismaClient } from '@prisma/client';

export type AnnouncementDb = PrismaClient;

export const announcementRepository = {
  findForStudent(db: AnnouncementDb, userId: string) {
    return db.announcement.findMany({
      where: {
        OR: [
          { audience: 'UNIVERSITY' },
          { audience: 'MEMBERS', club: { memberships: { some: { userId, status: 'APPROVED' } } } },
        ],
      },
      include: {
        club: { select: { name: true, slug: true } },
        author: { select: { fullName: true } },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    });
  },
};
