import type { PrismaClient } from '@prisma/client';

export type SpacesDb = PrismaClient;

export const spacesRepository = {
  findForUser(db: SpacesDb, userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        memberships: {
          orderBy: { appliedAt: 'desc' },
          select: {
            role: true,
            status: true,
            club: {
              select: {
                name: true,
                slug: true,
                logoUrl: true,
                status: true,
                _count: {
                  select: {
                    memberships: { where: { status: 'APPROVED' } },
                  },
                },
                memberships: {
                  where: { status: 'PENDING' },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });
  },
};
