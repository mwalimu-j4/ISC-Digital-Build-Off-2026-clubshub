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
  findPublicDiscoverable(
    db: ClubDb,
    filters: { search?: string; category?: string; skip: number; take: number },
  ) {
    const where: Prisma.ClubWhereInput = { status: 'ACTIVE' };
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return db.club.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: filters.skip,
      take: filters.take,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        logoUrl: true,
        _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
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
        createdAt: true,
        _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
        memberships: {
          where: { status: 'APPROVED', role: 'CLUB_ADMIN' },
          select: {
            user: { select: { fullName: true } },
            role: true,
          },
          take: 3,
        },
        events: {
          where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
          orderBy: { startsAt: 'asc' },
          take: 3,
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startsAt: true,
            capacity: true,
            _count: { select: { registrations: { where: { status: 'REGISTERED' } } } },
          },
        },
        announcements: {
          where: { audience: 'UNIVERSITY' },
          orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
          take: 3,
          select: { id: true, title: true, body: true, pinned: true, createdAt: true },
        },
      },
    });
  },
  findOwned(db: ClubDb, userId: string) {
    return db.club.findMany({ where: { createdById: userId }, orderBy: { createdAt: 'desc' } });
  },
  findDiscoverable(
    db: ClubDb,
    filters: { search?: string; category?: string; skip: number; take: number },
  ) {
    const where: Prisma.ClubWhereInput = { status: 'ACTIVE' };
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return db.club.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: filters.skip,
      take: filters.take,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        logoUrl: true,
        _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
      },
    });
  },
  findMembership(db: ClubDb, userId: string, clubId: string) {
    return db.clubMembership.findUnique({ where: { userId_clubId: { userId, clubId } } });
  },
  listMemberships(db: ClubDb, userId: string) {
    return db.clubMembership.findMany({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            logoUrl: true,
            _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  },
  applyMembership(db: ClubDb, userId: string, clubId: string) {
    return db.clubMembership.upsert({
      where: { userId_clubId: { userId, clubId } },
      create: { userId, clubId },
      update: { status: 'PENDING', appliedAt: new Date() },
    });
  },
  leaveMembership(db: ClubDb, userId: string, clubId: string) {
    return db.clubMembership.update({
      where: { userId_clubId: { userId, clubId } },
      data: { status: 'LEFT' },
    });
  },
};
