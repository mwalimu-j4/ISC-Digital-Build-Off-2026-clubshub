import type { Prisma, PrismaClient } from '@prisma/client';

export type ClubDb = PrismaClient | Prisma.TransactionClient;

export const clubRepository = {
  create(db: ClubDb, data: Prisma.ClubCreateInput) {
    return db.club.create({ data });
  },
  findById(db: ClubDb, id: string) {
    return db.club.findUnique({ where: { id }, include: { memberships: true } });
  },
  findPublic(db: ClubDb) {
    return db.club.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        purpose: true,
        activities: true,
        category: true,
        logoUrl: true,
      },
    });
  },
  findPublicBySlug(db: ClubDb, slug: string) {
    return db.club.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        purpose: true,
        activities: true,
        category: true,
        logoUrl: true,
      },
    });
  },
  findOwned(db: ClubDb, userId: string) {
    return db.club.findMany({ where: { createdById: userId }, orderBy: { createdAt: 'desc' } });
  },
};
