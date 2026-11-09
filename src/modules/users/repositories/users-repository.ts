import type { Prisma, PrismaClient } from '@prisma/client';

import { USERS_PAGE_SIZE } from '@/modules/users/constants';
import type { UsersQuery } from '@/modules/users/validations/users-schema';

export type UsersDb = PrismaClient | Prisma.TransactionClient;

function whereForQuery(query: UsersQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (query.q) {
    where.OR = [
      { fullName: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  if (query.role === 'CLUB_ADMIN') {
    where.memberships = { some: { role: 'CLUB_ADMIN', status: 'APPROVED' } };
  } else if (query.role !== 'ALL') {
    where.role = query.role;
  }
  if (query.status === 'ACTIVE') where.status = 'ACTIVE';
  if (query.status === 'SUSPENDED') where.status = 'SUSPENDED';
  return where;
}

const listSelect = {
  id: true,
  fullName: true,
  email: true,
  avatarUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
  memberships: {
    where: { role: 'CLUB_ADMIN', status: 'APPROVED' },
    select: { id: true },
    take: 1,
  },
} satisfies Prisma.UserSelect;

export const usersRepository = {
  list(db: UsersDb, query: UsersQuery) {
    return db.user.findMany({
      where: whereForQuery(query),
      orderBy: query.sort === 'name' ? { fullName: 'asc' } : { createdAt: 'desc' },
      skip: (query.page - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
      select: listSelect,
    });
  },

  count(db: UsersDb, query: UsersQuery) {
    return db.user.count({ where: whereForQuery(query) });
  },

  async counts(db: UsersDb) {
    const [students, clubAdminUsers, superAdmins, suspended] = await Promise.all([
      db.user.count({ where: { role: 'STUDENT', status: { not: 'DEACTIVATED' } } }),
      db.clubMembership.groupBy({
        by: ['userId'],
        where: { role: 'CLUB_ADMIN', status: 'APPROVED' },
      }),
      db.user.count({ where: { role: 'SUPER_ADMIN', status: { not: 'DEACTIVATED' } } }),
      db.user.count({ where: { status: 'SUSPENDED' } }),
    ]);
    return { students, clubAdmins: clubAdminUsers.length, superAdmins, suspended };
  },

  detail(db: UsersDb, id: string) {
    return db.user.findUnique({
      where: { id },
      select: {
        ...listSelect,
        studentRegistrationId: true,
        suspendedAt: true,
        suspendedReason: true,
        memberships: {
          orderBy: { appliedAt: 'desc' },
          select: {
            id: true,
            clubId: true,
            role: true,
            status: true,
            club: { select: { name: true, slug: true } },
          },
        },
      },
    });
  },

  findForMutation(db: UsersDb, id: string) {
    return db.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true, updatedAt: true },
    });
  },

  countSuperAdmins(db: UsersDb) {
    return db.user.count({ where: { role: 'SUPER_ADMIN', status: { not: 'DEACTIVATED' } } });
  },
};
