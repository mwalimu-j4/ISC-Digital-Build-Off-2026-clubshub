import type { Prisma, PrismaClient } from '@prisma/client';

export type ProfileDb = PrismaClient | Prisma.TransactionClient;

export const profileRepository = {
  findById(db: ProfileDb, id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { status: 'APPROVED' },
          include: { club: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        },
      },
    });
  },

  update(db: ProfileDb, id: string, data: Prisma.UserUpdateInput) {
    return db.user.update({
      where: { id },
      data,
    });
  },

  async getStats(db: ProfileDb, userId: string) {
    const [clubsJoined, itemsReported] = await Promise.all([
      db.clubMembership.count({
        where: {
          userId,
          status: 'APPROVED',
        },
      }),
      db.lostFoundItem.count({
        where: {
          reportedById: userId,
        },
      }),
    ]);

    return { clubsJoined, itemsReported };
  },

  getMemberships(db: ProfileDb, userId: string) {
    return db.clubMembership.findMany({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            status: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  },

  getProposedClubs(db: ProfileDb, userId: string) {
    return db.club.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        logoUrl: true,
        createdAt: true,
        rejectionReason: true,
        changeRequestReason: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  getRecentActivity(db: ProfileDb, userId: string, limit = 20) {
    return db.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        targetEntity: true,
        targetEntityId: true,
        metadata: true,
        createdAt: true,
      },
    });
  },
};
