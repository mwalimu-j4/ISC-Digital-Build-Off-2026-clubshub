import type { MembershipStatus, Prisma, PrismaClient } from '@prisma/client';

export type JoinRequestDb = PrismaClient | Prisma.TransactionClient;

const requestSelect = {
  id: true,
  status: true,
  appliedAt: true,
  approvedAt: true,
  department: true,
  major: true,
  message: true,
  yearOfStudy: true,
  decisionNote: true,
  decisionReason: true,
  decidedAt: true,
  user: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.ClubMembershipSelect;

export const joinRequestRepository = {
  findForUser(db: JoinRequestDb, userId: string, clubId: string) {
    return db.clubMembership.findUnique({
      where: { userId_clubId: { userId, clubId } },
      select: { id: true, status: true, appliedAt: true, decidedAt: true },
    });
  },
  listForClub(db: JoinRequestDb, clubId: string, status: MembershipStatus) {
    return db.clubMembership.findMany({
      where: { clubId, status },
      orderBy: status === 'PENDING' ? { appliedAt: 'asc' } : { decidedAt: 'desc' },
      take: 20,
      select: requestSelect,
    });
  },
  countByStatus(db: JoinRequestDb, clubId: string) {
    return db.clubMembership.groupBy({
      by: ['status'],
      where: { clubId },
      _count: { _all: true },
    });
  },
  findById(db: JoinRequestDb, id: string) {
    return db.clubMembership.findUnique({
      where: { id },
      select: {
        ...requestSelect,
        clubId: true,
        schoolId: true,
        decidedById: true,
        undoUntil: true,
      },
    });
  },
};
