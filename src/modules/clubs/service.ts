import type { ClubStatus, Prisma, PrismaClient, UserRole } from '@prisma/client';
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
  const club = await clubRepository.create(db, {
    ...data,
    logoUrl: data.logoUrl || null,
    slug: `${slugify(data.name)}-${crypto.randomUUID().slice(0, 8)}`,
    createdBy: { connect: { id: actor.id } },
  });
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
