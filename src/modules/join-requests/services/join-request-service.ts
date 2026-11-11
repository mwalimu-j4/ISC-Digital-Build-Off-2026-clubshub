import { type MembershipStatus, type UserRole } from '@prisma/client';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import {
  DEPARTMENTS,
  REAPPLY_COOLDOWN_DAYS,
  UNDO_WINDOW_SECONDS,
} from '@/modules/join-requests/constants';
import {
  type JoinRequestDb,
  joinRequestRepository,
} from '@/modules/join-requests/repositories/join-request-repository';
import {
  type DecisionInput,
  decisionSchema,
  joinRequestSchema,
} from '@/modules/join-requests/validations/join-request-schema';
import { createNotification } from '@/modules/notifications/services/notification-service';

export class JoinRequestServiceError extends Error {}

type Actor = { id: string; role: UserRole };

async function requireClubAdmin(db: JoinRequestDb, actorId: string, clubId: string) {
  const membership = await db.clubMembership.findFirst({
    where: { userId: actorId, clubId, role: 'CLUB_ADMIN', status: 'APPROVED' },
    select: { id: true },
  });
  if (!membership) throw new JoinRequestServiceError('Approved club-admin access is required');
}

function assertStudent(actor: Actor) {
  if (actor.role !== 'STUDENT') throw new JoinRequestServiceError('Student access is required');
}

export async function submitJoinRequest(
  actor: Actor,
  clubId: string,
  input: unknown,
  db: JoinRequestDb = prisma,
) {
  assertStudent(actor);
  const data = joinRequestSchema.parse(input);
  const club = await db.club.findUnique({ where: { id: clubId }, select: { status: true } });
  if (club?.status !== 'ACTIVE')
    throw new JoinRequestServiceError('This club is not accepting requests');
  const existing = await joinRequestRepository.findForUser(db, actor.id, clubId);
  if (existing?.status === 'APPROVED' || existing?.status === 'PENDING')
    throw new JoinRequestServiceError('You already have an active request for this club');
  if (
    existing?.status === 'REJECTED' &&
    existing.decidedAt &&
    Date.now() - existing.decidedAt.getTime() < REAPPLY_COOLDOWN_DAYS * 86_400_000
  ) {
    throw new JoinRequestServiceError('Please wait before applying to this club again');
  }
  const request = await db.clubMembership.upsert({
    where: { userId_clubId: { userId: actor.id, clubId } },
    create: {
      userId: actor.id,
      clubId,
      status: 'PENDING',
      fullName: data.fullName,
      schoolId: data.schoolId,
      department: data.department,
      major: data.major,
      yearOfStudy: null,
      message: null,
    },
    update: {
      status: 'PENDING',
      appliedAt: new Date(),
      fullName: data.fullName,
      schoolId: data.schoolId,
      department: data.department,
      major: data.major,
      yearOfStudy: null,
      message: null,
      decidedAt: null,
      decisionNote: null,
      decisionReason: null,
      decidedById: null,
      undoUntil: null,
    },
  });
  await recordAuditLog(db, {
    action: 'CLUB_JOIN_REQUEST_SUBMITTED',
    actorId: actor.id,
    targetEntity: 'ClubMembership',
    targetEntityId: request.id,
  });
  return request;
}

export async function listRequests(actor: Actor, clubId: string, status: MembershipStatus) {
  if (!actor.id) throw new JoinRequestServiceError('Authentication is required');
  await requireClubAdmin(prisma, actor.id, clubId);
  const [requests, counts] = await Promise.all([
    joinRequestRepository.listForClub(prisma, clubId, status),
    joinRequestRepository.countByStatus(prisma, clubId),
  ]);
  return { requests, counts };
}

export async function decideRequest(
  actor: Actor,
  requestId: string,
  input: DecisionInput,
  db: JoinRequestDb = prisma,
) {
  if (!actor.id) throw new JoinRequestServiceError('Authentication is required');
  const data = decisionSchema.parse(input);
  const existing = await joinRequestRepository.findById(db, requestId);
  if (!existing) throw new JoinRequestServiceError('Request not found');
  await requireClubAdmin(db, actor.id, existing.clubId);
  if (existing.status !== 'PENDING')
    throw new JoinRequestServiceError('Another admin already decided this request');
  const run = async (tx: JoinRequestDb) => {
    const updated = await tx.clubMembership.updateMany({
      where: { id: requestId, status: 'PENDING' },
      data:
        data.decision === 'APPROVE'
          ? {
              status: 'APPROVED',
              role: 'MEMBER',
              approvedAt: new Date(),
              decidedById: actor.id,
              decidedAt: new Date(),
              decisionNote: data.note || null,
              decisionReason: null,
              undoUntil: new Date(Date.now() + UNDO_WINDOW_SECONDS * 1000),
            }
          : {
              status: 'REJECTED',
              decidedById: actor.id,
              decidedAt: new Date(),
              decisionNote: data.note || null,
              decisionReason: data.reason,
              undoUntil: null,
            },
    });
    if (updated.count !== 1)
      throw new JoinRequestServiceError('Another admin already decided this request');
    await recordAuditLog(tx, {
      action: `CLUB_JOIN_REQUEST_${data.decision}D`,
      actorId: actor.id,
      targetEntity: 'ClubMembership',
      targetEntityId: requestId,
      metadata: data.decision === 'REJECT' ? { reason: data.reason } : undefined,
    });
    await createNotification(
      {
        recipientId: existing.user.id,
        type: 'GENERAL',
        title:
          data.decision === 'APPROVE' ? 'Your request was approved' : 'Your request was declined',
        message:
          data.note || (data.decision === 'REJECT' ? data.reason : undefined) ||
          'Your club join request has been reviewed.',
      },
      tx,
    );
  };
  return '$transaction' in db ? db.$transaction(run) : run(db);
}

export async function undoDecision(actor: Actor, requestId: string) {
  const existing = await joinRequestRepository.findById(prisma, requestId);
  if (!existing) throw new JoinRequestServiceError('Request not found');
  await requireClubAdmin(prisma, actor.id, existing.clubId);
  if (!existing.undoUntil || existing.undoUntil < new Date())
    throw new JoinRequestServiceError('The undo window has expired');
  await prisma.clubMembership.update({
    where: { id: requestId },
    data: {
      status: 'PENDING',
      approvedAt: null,
      decidedAt: null,
      decidedById: null,
      undoUntil: null,
    },
  });
  await recordAuditLog(prisma, {
    action: 'CLUB_JOIN_REQUEST_UNDONE',
    actorId: actor.id,
    targetEntity: 'ClubMembership',
    targetEntityId: requestId,
  });
}

export { DEPARTMENTS };
