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

export const announcementAdminRepository = {
  findForClubAdmin(db: AnnouncementDb, clubId: string) {
    return db.announcement.findMany({
      where: { clubId },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        club: { select: { name: true, slug: true } },
        author: { select: { fullName: true } },
      },
    });
  },

  createForClubAdmin(
    db: AnnouncementDb,
    data: {
      clubId: string;
      authorId: string;
      title: string;
      body: string;
      audience: 'MEMBERS' | 'UNIVERSITY';
      pinned: boolean;
    },
  ) {
    return db.announcement.create({
      data: {
        club: { connect: { id: data.clubId } },
        author: { connect: { id: data.authorId } },
        title: data.title,
        body: data.body,
        audience: data.audience,
        pinned: data.pinned,
      },
    });
  },

  updateForClubAdmin(
    db: AnnouncementDb,
    clubId: string,
    announcementId: string,
    data: { title: string; body: string; audience: 'MEMBERS' | 'UNIVERSITY'; pinned: boolean },
  ) {
    return db.announcement.updateMany({
      where: { id: announcementId, clubId },
      data,
    });
  },

  deleteForClubAdmin(db: AnnouncementDb, clubId: string, announcementId: string) {
    return db.announcement.deleteMany({
      where: { id: announcementId, clubId },
    });
  },
};
