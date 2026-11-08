import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { adminOverviewRepository } from '@/modules/admin-overview/repository';

function assertSuperAdmin(role: UserRole) {
  if (role !== 'SUPER_ADMIN') throw new Error('Super-admin access is required');
}

function monthStart(offset: number) {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - offset, 1);
}

export async function getAdminOverview(actor: { role: UserRole }) {
  assertSuperAdmin(actor.role);
  const [counts, pending, memberDates, categories, decisions] = await Promise.all([
    adminOverviewRepository.getCounts(prisma),
    adminOverviewRepository.getPending(prisma),
    adminOverviewRepository.getMemberDates(prisma),
    adminOverviewRepository.getCategoryCounts(prisma),
    adminOverviewRepository.getRecentDecisions(prisma),
  ]);
  const now = new Date();
  const monthAgo = monthStart(1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oldest = pending[0]?.createdAt;

  return {
    pendingApprovals: counts[0],
    activeClubs: counts[1],
    registeredStudents: counts[2],
    eventsThisMonth: counts[3],
    registrationsThisMonth: counts[4],
    newMembersThisMonth: memberDates.filter((item) => item.appliedAt >= monthAgo).length,
    newStudentsThisWeek: memberDates.filter((item) => item.appliedAt >= weekAgo).length,
    oldestWaitingDays: oldest
      ? Math.max(0, Math.floor((now.getTime() - oldest.getTime()) / 86_400_000))
      : 0,
    pending,
    categories: categories.map((item) => ({ name: item.category, count: item._count._all })),
    decisions,
    memberTrend: Array.from({ length: 5 }, (_, index) => {
      const start = monthStart(4 - index);
      const end = index === 4 ? now : monthStart(3 - index);
      return {
        label: start.toLocaleDateString('en-US', { month: 'short' }),
        count: memberDates.filter((item) => item.appliedAt >= start && item.appliedAt < end).length,
      };
    }),
    alerts: {
      approvalsOver48Hours: pending.filter(
        (item) => now.getTime() - item.createdAt.getTime() > 48 * 60 * 60 * 1000,
      ).length,
    },
  };
}
