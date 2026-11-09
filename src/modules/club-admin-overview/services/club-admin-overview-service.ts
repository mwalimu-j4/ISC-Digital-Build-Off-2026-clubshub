import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { clubAdminOverviewRepository } from '@/modules/club-admin-overview/repositories/club-admin-overview-repository';
import { clubAdminSlugSchema } from '@/modules/club-admin-overview/validations/club-admin-schema';

export class ClubAdminAuthorizationError extends Error {}

type ClubAdminActor = { id: string; role: UserRole };

function assertAuthenticated(actor: ClubAdminActor) {
  if (!actor.id) throw new ClubAdminAuthorizationError('Authentication is required');
}

export async function listClubAdminClubs(actor: ClubAdminActor) {
  assertAuthenticated(actor);
  return clubAdminOverviewRepository.findAdminClubs(prisma, actor.id);
}

export async function getClubAdminOverview(actor: ClubAdminActor, slug: unknown) {
  assertAuthenticated(actor);
  const parsedSlug = clubAdminSlugSchema.parse(slug);
  const club = await clubAdminOverviewRepository.findClubForAdmin(prisma, actor.id, parsedSlug);
  if (!club) throw new ClubAdminAuthorizationError('Club-admin access is required');
  const auditLogs = await clubAdminOverviewRepository.findRecentActivity(prisma, club.id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const upcomingEvents = club.events.filter((event) => event.startsAt >= now);
  const nextEvent = upcomingEvents.find((event) => event.status === 'PUBLISHED');
  const membersThisMonth = club.memberships.filter(
    (membership) => membership.approvedAt && membership.approvedAt >= monthStart,
  ).length;
  const healthScore = Math.min(
    100,
    (club.memberships.length > 0 ? 40 : 0) +
      Math.min(club._count.events * 15, 30) +
      Math.min(club.announcements.length * 10, 30),
  );
  const health = healthScore >= 70 ? 'Strong' : healthScore >= 40 ? 'Steady' : 'Quiet';

  return {
    ...club,
    auditLogs,
    metrics: {
      memberCount: club.memberships.length,
      membersThisMonth,
      pendingRequests: club._count.memberships,
      upcomingEventCount: club._count.events,
      nextEvent,
      health,
      healthScore,
    },
  };
}
