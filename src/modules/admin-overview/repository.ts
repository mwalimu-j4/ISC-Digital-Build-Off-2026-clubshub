import type { PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';

export type AdminOverviewDb = PrismaClient;

export const adminOverviewRepository = {
  getCounts(db: AdminOverviewDb = prisma) {
    return Promise.all([
      db.club.count({ where: { status: { in: ['PENDING', 'CHANGES_REQUESTED'] } } }),
      db.club.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      db.event.count({
        where: {
          startsAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.eventRegistration.count({
        where: {
          status: 'REGISTERED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);
  },
  getPending(db: AdminOverviewDb = prisma) {
    return db.club.findMany({
      where: { status: { in: ['PENDING', 'CHANGES_REQUESTED'] } },
      orderBy: { createdAt: 'asc' },
      take: 4,
      select: { id: true, name: true, category: true, createdAt: true, status: true },
    });
  },
  getMemberDates(db: AdminOverviewDb = prisma) {
    return db.clubMembership.findMany({ select: { appliedAt: true } });
  },
  getCategoryCounts(db: AdminOverviewDb = prisma) {
    return db.club.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: { _all: true },
      orderBy: { _count: { category: 'desc' } },
      take: 4,
    });
  },
  getRecentDecisions(db: AdminOverviewDb = prisma) {
    return db.auditLog.findMany({
      where: { targetEntity: 'Club' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        action: true,
        createdAt: true,
        actor: { select: { fullName: true } },
        targetEntityId: true,
      },
    });
  },
};
