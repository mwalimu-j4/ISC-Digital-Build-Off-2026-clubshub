import type { LostFoundStatus, Prisma, PrismaClient, UserRole } from '@prisma/client';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import { DEFAULT_CHECKPOINTS } from '@/modules/lost-found/constants';
import { findMatches } from '@/modules/lost-found/matching';
import {
  notifyClaimSubmitted,
  notifyFoundReportCreated,
  notifyItemHandedOver,
  notifyItemRecovered,
  notifyLostReportCreated,
  notifyOwnershipVerified,
  notifyPossibleMatch,
  notifyReadyForCollection,
  notifyRecoveryOfficers,
  notifyRecoveryStarted,
  notifyRecoveryTaskCreated,
} from '@/modules/lost-found/notification-service';
import {
  claimRepository,
  type LostFoundDb,
  lostFoundRepository,
  matchRepository,
  notificationRepository,
  recoveryTaskRepository,
} from '@/modules/lost-found/repository';
import {
  type CheckpointUpdateInput,
  checkpointUpdateSchema,
  type ClaimInput,
  type ClaimReviewInput,
  claimReviewSchema,
  claimSchema,
  type FoundReportInput,
  foundReportSchema,
  type LostReportInput,
  lostReportSchema,
  type MatchActionInput,
  matchActionSchema,
  type RecoveryTaskUpdateInput,
  recoveryTaskUpdateSchema,
  type StatusUpdateInput,
  statusUpdateSchema,
} from '@/modules/lost-found/schemas';

export class LostFoundServiceError extends Error {}

type Actor = { id: string; role: UserRole };

function isOfficerOrAdmin(role: UserRole) {
  return role === 'RECOVERY_OFFICER' || role === 'SUPER_ADMIN';
}

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'LF';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

async function addStatusHistory(
  db: LostFoundDb,
  itemId: string,
  status: LostFoundStatus,
  actorId: string,
  note?: string,
) {
  await db.lostFoundStatusHistory.create({
    data: {
      item: { connect: { id: itemId } },
      status,
      actor: { connect: { id: actorId } },
      note: note || null,
    },
  });
}

// ── Report creation ───────────────────────────────────────────────────

export async function submitLostReport(
  actor: Actor,
  input: LostReportInput,
  db: PrismaClient = prisma,
) {
  const data = lostReportSchema.parse(input);

  return db.$transaction(async (tx) => {
    const item = await lostFoundRepository.create(tx, {
      reportType: 'LOST',
      status: 'PENDING_REVIEW',
      category: 'OTHER',
      name: data.name,
      description: data.description || '',
      campusArea: data.location,
      building: null,
      specificLocation: null,
      dateOccurred: new Date(data.dateOccurred),
      images: data.images,
      referenceCode: generateReferenceCode(),
      reportedBy: { connect: { id: actor.id } },
    });

    await addStatusHistory(tx, item.id, 'PENDING_REVIEW', actor.id, 'Lost item report submitted');

    // Create recovery task automatically
    const building = '';
    const checkpoints = DEFAULT_CHECKPOINTS[building] ?? ['General area search'];
    const task = await recoveryTaskRepository.create(tx, {
      item: { connect: { id: item.id } },
      priority: 'MEDIUM',
      status: 'PENDING',
    });

    for (const area of checkpoints) {
      await tx.recoveryCheckpoint.create({
        data: {
          task: { connect: { id: task.id } },
          areaName: area,
        },
      });
    }

    await recordAuditLog(tx, {
      action: 'LOST_REPORT_SUBMITTED',
      actorId: actor.id,
      targetEntity: 'LostFoundItem',
      targetEntityId: item.id,
    });

    // Fire-and-forget notifications (outside transaction for performance)
    notifyLostReportCreated(item.id, actor.id, data.name).catch(() => {});
    notifyRecoveryTaskCreated(item.id, actor.id, data.name).catch(() => {});
    notifyRecoveryOfficers(prisma, item.id, data.name, data.location).catch(() => {});

    return item;
  });
}

export async function submitFoundReport(
  actor: Actor,
  input: FoundReportInput,
  db: PrismaClient = prisma,
) {
  const data = foundReportSchema.parse(input);

  return db.$transaction(async (tx) => {
    const item = await lostFoundRepository.create(tx, {
      reportType: 'FOUND',
      status: 'PENDING_REVIEW',
      category: 'OTHER',
      name: data.name,
      description: data.description || '',
      campusArea: data.location,
      building: null,
      specificLocation: null,
      dateOccurred: new Date(data.dateOccurred),
      images: data.images,
      currentHolding: data.currentHolding,
      referenceCode: generateReferenceCode(),
      reportedBy: { connect: { id: actor.id } },
    });

    await addStatusHistory(tx, item.id, 'PENDING_REVIEW', actor.id, 'Found item report submitted');

    await recordAuditLog(tx, {
      action: 'FOUND_REPORT_SUBMITTED',
      actorId: actor.id,
      targetEntity: 'LostFoundItem',
      targetEntityId: item.id,
    });

    notifyFoundReportCreated(item.id, actor.id, data.name).catch(() => {});

    return item;
  });
}

// ── Listing & retrieval ───────────────────────────────────────────────

export async function getItems(filters: {
  reportType?: string;
  status?: string;
  category?: string;
  campusArea?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return lostFoundRepository.findList(prisma, filters as any);
}

export async function getItemDetail(id: string) {
  return lostFoundRepository.findById(prisma, id);
}

export async function getMyReports(actor: Actor) {
  return lostFoundRepository.findByUser(prisma, actor.id);
}

export async function getStats() {
  const grouped = await lostFoundRepository.countByStatus(prisma);
  let activeLost = 0;
  let foundItems = 0;
  let recovered = 0;
  for (const g of grouped) {
    if (g.reportType === 'LOST' && !['RECOVERED', 'CLOSED', 'REJECTED'].includes(g.status)) {
      activeLost += g._count.id;
    }
    if (g.reportType === 'FOUND') {
      foundItems += g._count.id;
    }
    if (g.status === 'RECOVERED') {
      recovered += g._count.id;
    }
  }

  const searches = await prisma.recoveryTask.count({
    where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
  });

  return { activeLost, foundItems, searches, recovered };
}

// ── Status management ─────────────────────────────────────────────────

export async function updateItemStatus(actor: Actor, itemId: string, input: StatusUpdateInput) {
  if (!isOfficerOrAdmin(actor.role))
    throw new LostFoundServiceError('Only officers and admins can update status');
  const data = statusUpdateSchema.parse(input);

  await prisma.$transaction(async (tx) => {
    await lostFoundRepository.updateStatus(tx, itemId, data.status);
    await addStatusHistory(tx, itemId, data.status, actor.id, data.note);
    await recordAuditLog(tx, {
      action: `ITEM_STATUS_${data.status}`,
      actorId: actor.id,
      targetEntity: 'LostFoundItem',
      targetEntityId: itemId,
      metadata: data.note ? { note: data.note } : undefined,
    });
  });

  // Notifications based on new status
  const item = await prisma.lostFoundItem.findUnique({
    where: { id: itemId },
    select: { name: true, reportedById: true },
  });
  if (item) {
    if (data.status === 'READY_FOR_COLLECTION') {
      notifyReadyForCollection(itemId, item.reportedById, item.name).catch(() => {});
    } else if (data.status === 'RECOVERED') {
      notifyItemRecovered(itemId, item.reportedById, item.name).catch(() => {});
    }
  }
}

// ── Recovery operations ───────────────────────────────────────────────

export async function getRecoveryTasks(actor: Actor) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  return recoveryTaskRepository.findActive(
    prisma,
    actor.role === 'RECOVERY_OFFICER' ? actor.id : undefined,
  );
}

export async function getAllRecoveryTasks(actor: Actor) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  return recoveryTaskRepository.findActive(prisma);
}

export async function getRecoveryTask(actor: Actor, taskId: string) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  return recoveryTaskRepository.findById(prisma, taskId);
}

export async function updateRecoveryTask(
  actor: Actor,
  taskId: string,
  input: RecoveryTaskUpdateInput,
) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  const data = recoveryTaskUpdateSchema.parse(input);

  const task = await recoveryTaskRepository.findById(prisma, taskId);
  if (!task) throw new LostFoundServiceError('Task not found');

  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.RecoveryTaskUpdateInput = { searchNotes: data.notes || undefined };

    switch (data.action) {
      case 'start':
        updateData.status = 'IN_PROGRESS';
        updateData.startedAt = new Date();
        updateData.assignedTo = { connect: { id: actor.id } };
        await addStatusHistory(
          tx,
          task.itemId,
          'SEARCHING',
          actor.id,
          'Ground checking search started',
        );
        await lostFoundRepository.updateStatus(tx, task.itemId, 'SEARCHING');
        notifyRecoveryStarted(task.itemId, task.item.reportedBy.id, task.item.name).catch(() => {});
        break;
      case 'complete-found':
        updateData.status = 'COMPLETED_FOUND';
        updateData.completedAt = new Date();
        await addStatusHistory(
          tx,
          task.itemId,
          'VERIFIED',
          actor.id,
          'Item found during ground search',
        );
        await lostFoundRepository.updateStatus(tx, task.itemId, 'VERIFIED');
        break;
      case 'complete-not-found':
        updateData.status = 'COMPLETED_NOT_FOUND';
        updateData.completedAt = new Date();
        await addStatusHistory(
          tx,
          task.itemId,
          'SEARCHING',
          actor.id,
          'Ground search completed — item not found',
        );
        break;
      case 'escalate':
        updateData.status = 'ESCALATED';
        await addStatusHistory(
          tx,
          task.itemId,
          'SEARCHING',
          actor.id,
          'Search escalated for further investigation',
        );
        break;
      case 'cancel':
        updateData.status = 'CANCELLED';
        updateData.completedAt = new Date();
        break;
    }

    const updated = await recoveryTaskRepository.update(tx, taskId, updateData);

    await recordAuditLog(tx, {
      action: `RECOVERY_${data.action.toUpperCase().replace('-', '_')}`,
      actorId: actor.id,
      targetEntity: 'RecoveryTask',
      targetEntityId: taskId,
    });

    return updated;
  });
}

export async function updateCheckpoint(actor: Actor, input: CheckpointUpdateInput) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  const data = checkpointUpdateSchema.parse(input);

  return prisma.recoveryCheckpoint.update({
    where: { id: data.checkpointId },
    data: {
      searched: data.searched,
      notes: data.notes || null,
      searchedAt: data.searched ? new Date() : null,
      searchedBy: data.searched ? { connect: { id: actor.id } } : undefined,
    },
  });
}

// ── Matching ──────────────────────────────────────────────────────────

export async function runMatching(actor: Actor, itemId: string) {
  const item = await prisma.lostFoundItem.findUnique({ where: { id: itemId } });
  if (!item) throw new LostFoundServiceError('Item not found');

  const candidates = await lostFoundRepository.findMatchCandidates(
    prisma,
    {
      id: item.id,
      category: item.category,
      campusArea: item.campusArea,
      dateOccurred: item.dateOccurred,
    },
    item.reportType,
  );

  const results = findMatches(
    {
      name: item.name,
      description: item.description,
      category: item.category,
      color: item.color,
      brand: item.brand,
      model: item.model,
      campusArea: item.campusArea,
      building: item.building,
      dateOccurred: item.dateOccurred,
    },
    candidates.map((c) => ({ ...c, dateOccurred: c.dateOccurred })),
  );

  const created = [];
  for (const result of results.slice(0, 5)) {
    const lostItemId = item.reportType === 'LOST' ? item.id : result.candidateId;
    const foundItemId = item.reportType === 'FOUND' ? item.id : result.candidateId;

    const existing = await matchRepository.findByItems(prisma, lostItemId, foundItemId);
    if (existing) continue;

    const match = await matchRepository.create(prisma, {
      lostItem: { connect: { id: lostItemId } },
      foundItem: { connect: { id: foundItemId } },
      score: result.score,
      status: 'PENDING',
    });
    created.push(match);

    // Notify the owner of the other item
    const otherItem = candidates.find((c) => c.id === result.candidateId);
    if (otherItem) {
      // We need the reporter of the candidate
      const candidateFull = await prisma.lostFoundItem.findUnique({
        where: { id: result.candidateId },
        select: { reportedById: true, name: true },
      });
      if (candidateFull) {
        notifyPossibleMatch(
          result.candidateId,
          candidateFull.reportedById,
          candidateFull.name,
        ).catch(() => {});
      }
    }
    // Also notify the current item's reporter
    notifyPossibleMatch(item.id, item.reportedById, item.name).catch(() => {});
  }

  if (created.length > 0) {
    await lostFoundRepository.updateStatus(prisma, item.id, 'POSSIBLE_MATCH');
    await addStatusHistory(
      prisma,
      item.id,
      'POSSIBLE_MATCH',
      actor.id,
      `${created.length} possible match(es) found`,
    );
  }

  return { matchesFound: created.length, matches: created };
}

export async function handleMatchAction(actor: Actor, input: MatchActionInput) {
  const data = matchActionSchema.parse(input);
  const status = data.action === 'confirm' ? 'CONFIRMED' : 'REJECTED';

  return matchRepository.update(prisma, data.matchId, {
    status,
    notes: data.notes || null,
    reviewedBy: { connect: { id: actor.id } },
    reviewedAt: new Date(),
  });
}

// ── Claims ────────────────────────────────────────────────────────────

export async function submitClaim(actor: Actor, itemId: string, input: ClaimInput) {
  const data = claimSchema.parse(input);

  const item = await prisma.lostFoundItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, reportedById: true, reportType: true },
  });
  if (!item) throw new LostFoundServiceError('Item not found');

  const claim = await claimRepository.create(prisma, {
    item: { connect: { id: itemId } },
    claimant: { connect: { id: actor.id } },
    status: 'PENDING',
    verificationData: data.verificationData,
  });

  await addStatusHistory(
    prisma,
    itemId,
    'OWNERSHIP_VERIFICATION',
    actor.id,
    'Ownership claim submitted',
  );
  await lostFoundRepository.updateStatus(prisma, itemId, 'OWNERSHIP_VERIFICATION');

  const user = await prisma.user.findUnique({
    where: { id: actor.id },
    select: { fullName: true },
  });
  notifyClaimSubmitted(itemId, item.reportedById, item.name, user?.fullName ?? 'A user').catch(
    () => {},
  );

  await recordAuditLog(prisma, {
    action: 'CLAIM_SUBMITTED',
    actorId: actor.id,
    targetEntity: 'LostFoundClaim',
    targetEntityId: claim.id,
  });

  return claim;
}

export async function reviewClaim(actor: Actor, claimId: string, input: ClaimReviewInput) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');
  const data = claimReviewSchema.parse(input);

  const claim = await claimRepository.findById(prisma, claimId);
  if (!claim) throw new LostFoundServiceError('Claim not found');

  return prisma.$transaction(async (tx) => {
    if (data.decision === 'approve') {
      await claimRepository.update(tx, claimId, {
        status: 'APPROVED',
        verifiedBy: { connect: { id: actor.id } },
        verifiedAt: new Date(),
      });
      await lostFoundRepository.updateStatus(tx, claim.item.id, 'READY_FOR_COLLECTION');
      await addStatusHistory(
        tx,
        claim.item.id,
        'READY_FOR_COLLECTION',
        actor.id,
        'Ownership verified — ready for collection',
      );
      notifyOwnershipVerified(claim.item.id, claim.claimant.id, claim.item.name).catch(() => {});
      notifyReadyForCollection(claim.item.id, claim.claimant.id, claim.item.name).catch(() => {});
    } else if (data.decision === 'reject') {
      await claimRepository.update(tx, claimId, {
        status: 'REJECTED',
        verifiedBy: { connect: { id: actor.id } },
        verifiedAt: new Date(),
        rejectionReason: data.reason,
      });
    }

    await recordAuditLog(tx, {
      action: `CLAIM_${data.decision.toUpperCase()}`,
      actorId: actor.id,
      targetEntity: 'LostFoundClaim',
      targetEntityId: claimId,
    });
  });
}

export async function recordHandover(actor: Actor, claimId: string, notes?: string) {
  if (!isOfficerOrAdmin(actor.role)) throw new LostFoundServiceError('Not authorized');

  const claim = await claimRepository.findById(prisma, claimId);
  if (!claim || claim.status !== 'APPROVED')
    throw new LostFoundServiceError('Claim is not approved');

  return prisma.$transaction(async (tx) => {
    await claimRepository.update(tx, claimId, {
      status: 'HANDED_OVER',
      handoverNotes: notes || null,
      handedOverAt: new Date(),
      handedOverBy: { connect: { id: actor.id } },
    });

    await lostFoundRepository.updateStatus(tx, claim.item.id, 'HANDED_OVER');
    await addStatusHistory(
      tx,
      claim.item.id,
      'HANDED_OVER',
      actor.id,
      'Item handed over to verified owner',
    );

    // Auto-transition to recovered
    await lostFoundRepository.updateStatus(tx, claim.item.id, 'RECOVERED');
    await addStatusHistory(tx, claim.item.id, 'RECOVERED', actor.id, 'Item recovered successfully');

    notifyItemHandedOver(claim.item.id, claim.claimant.id, claim.item.name).catch(() => {});
    notifyItemRecovered(claim.item.id, claim.claimant.id, claim.item.name).catch(() => {});

    await recordAuditLog(tx, {
      action: 'ITEM_HANDED_OVER',
      actorId: actor.id,
      targetEntity: 'LostFoundItem',
      targetEntityId: claim.item.id,
    });
  });
}

// ── Notifications ─────────────────────────────────────────────────────

export async function getNotifications(actor: Actor, limit = 20) {
  return notificationRepository.findByUser(prisma, actor.id, limit);
}

export async function getUnreadCount(actor: Actor) {
  return notificationRepository.countUnread(prisma, actor.id);
}

export async function markNotificationRead(actor: Actor, notificationId: string) {
  return notificationRepository.markRead(prisma, notificationId, actor.id);
}

export async function markAllNotificationsRead(actor: Actor) {
  return notificationRepository.markAllRead(prisma, actor.id);
}
