import { type ClubStatus, Prisma, type PrismaClient, type UserRole } from '@prisma/client';
import { z } from 'zod';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import { type ClubDb, clubRepository } from '@/modules/clubs/repository';
import {
  type ClubProfileInput,
  clubProfileSchema,
  type ClubProposalInput,
  clubProposalSchema,
  type ReviewInput,
  reviewSchema,
} from '@/modules/clubs/schemas';

export class ClubServiceError extends Error {}
export class ClubNameConflictError extends ClubServiceError {}
const admin = (role: UserRole) => role === 'SUPER_ADMIN';

function assertAdmin(role: UserRole) {
  if (!admin(role)) throw new ClubServiceError('Super-admin access is required');
}

async function assertClubAdmin(db: ClubDb, actorId: string, clubId: string) {
  const membership = await db.clubMembership.findFirst({
    where: { clubId, userId: actorId, role: 'CLUB_ADMIN', status: 'APPROVED' },
  });
  if (!membership) throw new ClubServiceError('Approved club-admin membership is required');
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

export async function submitProposal(
  actor: { id: string; role: UserRole },
  input: ClubProposalInput,
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can submit proposals');
  const data = clubProposalSchema.parse(input);
  const existingClub = await clubRepository.findByName(db, data.name);
  if (existingClub)
    throw new ClubNameConflictError('A club with this name already exists or is pending review.');
  let club;
  try {
    club = await clubRepository.create(db, {
      ...data,
      logoUrl: data.logoUrl || null,
      slug: `${slugify(data.name)}-${crypto.randomUUID().slice(0, 8)}`,
      createdBy: { connect: { id: actor.id } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw new ClubNameConflictError('A club with this name already exists or is pending review.');
    throw error;
  }
  await recordAuditLog(db, {
    action: 'CLUB_PROPOSAL_SUBMITTED',
    actorId: actor.id,
    targetEntity: 'Club',
    targetEntityId: club.id,
  });
  return club;
}

export async function getOwnProposals(actor: { id: string; role: UserRole }, db: ClubDb = prisma) {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can view own proposals');
  return clubRepository.findOwned(db, actor.id);
}

export async function listReviewable(actor: { id: string; role: UserRole }, db: ClubDb = prisma) {
  assertAdmin(actor.role);
  return db.club.findMany({
    where: { status: { in: ['PENDING', 'CHANGES_REQUESTED'] } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function reviewProposal(
  actor: { id: string; role: UserRole },
  clubId: string,
  input: ReviewInput,
  db: ClubDb = prisma,
) {
  assertAdmin(actor.role);
  const review = reviewSchema.parse(input);
  const club = await db.club.findUnique({ where: { id: clubId } });
  if (!club || !['PENDING', 'CHANGES_REQUESTED'].includes(club.status))
    throw new ClubServiceError('Proposal is not reviewable');
  const status: ClubStatus =
    review.decision === 'approve'
      ? 'ACTIVE'
      : review.decision === 'reject'
        ? 'REJECTED'
        : 'CHANGES_REQUESTED';
  const run = async (tx: PrismaClient | Prisma.TransactionClient) => {
    const updated = await tx.club.update({
      where: { id: clubId },
      data: {
        status,
        reviewedBy: { connect: { id: actor.id } },
        reviewedAt: new Date(),
        rejectionReason: review.decision === 'reject' ? review.reason : null,
        changeRequestReason: review.decision === 'request-changes' ? review.reason : null,
        ...(review.decision === 'approve'
          ? {
              memberships: {
                upsert: {
                  where: { userId_clubId: { userId: club.createdById, clubId } },
                  create: {
                    userId: club.createdById,
                    role: 'CLUB_ADMIN',
                    status: 'APPROVED',
                    approvedAt: new Date(),
                  },
                  update: { role: 'CLUB_ADMIN', status: 'APPROVED', approvedAt: new Date() },
                },
              },
            }
          : {}),
      },
    });
    await recordAuditLog(tx, {
      action: `CLUB_${status}`,
      actorId: actor.id,
      targetEntity: 'Club',
      targetEntityId: clubId,
      metadata: review.decision === 'approve' ? undefined : { reason: review.reason },
    });
    return updated;
  };
  return '$transaction' in db ? db.$transaction(run) : run(db);
}

export async function updateClubProfile(
  actor: { id: string; role: UserRole },
  clubId: string,
  input: ClubProfileInput,
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT')
    throw new ClubServiceError('Club profile updates require a club admin');
  await assertClubAdmin(db, actor.id, clubId);
  const data = clubProfileSchema.parse(input);
  const club = await db.club.findUnique({ where: { id: clubId }, select: { status: true } });
  if (club?.status !== 'ACTIVE') throw new ClubServiceError('Only active clubs can be updated');
  const updated = await db.club.update({
    where: { id: clubId },
    data: { ...data, logoUrl: data.logoUrl || null },
  });
  await recordAuditLog(db, {
    action: 'CLUB_PROFILE_UPDATED',
    actorId: actor.id,
    targetEntity: 'Club',
    targetEntityId: clubId,
  });
  return updated;
}

export async function setClubSuspension(
  actor: { id: string; role: UserRole },
  clubId: string,
  suspended: boolean,
  db: ClubDb = prisma,
) {
  assertAdmin(actor.role);
  const status: ClubStatus = suspended ? 'SUSPENDED' : 'ACTIVE';
  const updated = await db.club.update({
    where: { id: clubId },
    data: {
      status,
      suspendedAt: suspended ? new Date() : null,
      suspendedBy: suspended ? { connect: { id: actor.id } } : { disconnect: true },
    },
  });
  await recordAuditLog(db, {
    action: suspended ? 'CLUB_SUSPENDED' : 'CLUB_REACTIVATED',
    actorId: actor.id,
    targetEntity: 'Club',
    targetEntityId: clubId,
  });
  return updated;
}

export const listApprovedClubs = (db: ClubDb = prisma) => clubRepository.findPublic(db);
export const getApprovedClub = (slug: string, db: ClubDb = prisma) =>
  z.string().min(1).parse(slug) && clubRepository.findPublicBySlug(db, slug);

export async function getMembershipStatus(
  actor: { id: string; role: UserRole },
  clubId: string,
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT') return null;
  const id = z.string().uuid().parse(clubId);
  const membership = await clubRepository.findMembership(db, actor.id, id);
  return membership?.status ?? null;
}

export async function listPublicClubs(
  filters: { search?: string; category?: string; page?: number },
  db: ClubDb = prisma,
) {
  const page = Math.max(1, filters.page ?? 1);
  return clubRepository.findPublicDiscoverable(db, {
    search: filters.search,
    category: filters.category,
    skip: (page - 1) * 24,
    take: 24,
  });
}

export async function discoverClubs(
  actor: { id: string; role: UserRole },
  filters: { search?: string; category?: string; page?: number },
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can discover clubs');
  const page = Math.max(1, filters.page ?? 1);
  const clubs = await clubRepository.findDiscoverable(db, {
    search: filters.search,
    category: filters.category,
    skip: (page - 1) * 12,
    take: 12,
  });
  const memberships = await db.clubMembership.findMany({
    where: { userId: actor.id, clubId: { in: clubs.map((club) => club.id) } },
    select: { clubId: true, status: true },
  });
  const membershipByClub = new Map(
    memberships.map((membership) => [membership.clubId, membership.status]),
  );
  return clubs.map((club) => ({
    ...club,
    membershipStatus: membershipByClub.get(club.id) ?? null,
  }));
}

export async function joinClub(
  actor: { id: string; role: UserRole },
  clubId: string,
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can join clubs');
  const id = z.string().uuid().parse(clubId);
  const club = await db.club.findFirst({ where: { id, status: 'ACTIVE' }, select: { id: true } });
  if (!club) throw new ClubServiceError('Club not found');
  const membership = await clubRepository.findMembership(db, actor.id, id);
  if (membership?.status === 'APPROVED') throw new ClubServiceError('Already a member');
  if (membership?.status === 'SUSPENDED' || membership?.status === 'GRADUATED') {
    throw new ClubServiceError(
      'This membership cannot be reopened. Contact the club administrator for help.',
    );
  }
  return clubRepository.applyMembership(db, actor.id, id);
}

export async function leaveClub(
  actor: { id: string; role: UserRole },
  clubId: string,
  db: ClubDb = prisma,
) {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can leave clubs');
  const id = z.string().uuid().parse(clubId);
  const membership = await clubRepository.findMembership(db, actor.id, id);
  if (!membership || membership.status !== 'APPROVED')
    throw new ClubServiceError('Active membership not found');
  return clubRepository.leaveMembership(db, actor.id, id);
}

export const getOwnMemberships = (actor: { id: string; role: UserRole }, db: ClubDb = prisma) => {
  if (actor.role !== 'STUDENT') throw new ClubServiceError('Only students can view memberships');
  return clubRepository.listMemberships(db, actor.id);
};
