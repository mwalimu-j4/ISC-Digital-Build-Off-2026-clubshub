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
};
