import type { NotificationType } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import type { LostFoundDb } from '@/modules/lost-found/repository';

export async function createNotification(
  db: LostFoundDb,
  params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntity?: string;
    relatedEntityId?: string;
    actionUrl?: string;
    itemId?: string;
  },
) {
  return db.notification.create({
    data: {
      recipient: { connect: { id: params.recipientId } },
      type: params.type,
      title: params.title,
      message: params.message,
      relatedEntity: params.relatedEntity,
      relatedEntityId: params.relatedEntityId,
      actionUrl: params.actionUrl,
      ...(params.itemId ? { item: { connect: { id: params.itemId } } } : {}),
    },
  });
}

export async function notifyLostReportCreated(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'LOST_REPORT_CREATED',
    title: 'Lost item report submitted',
    message: `Your lost report for "${itemName}" has been submitted and is under review.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyFoundReportCreated(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'FOUND_REPORT_CREATED',
    title: 'Found item report submitted',
    message: `Your found report for "${itemName}" has been submitted and is under review.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyRecoveryTaskCreated(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'RECOVERY_TASK_CREATED',
    title: 'Recovery search initiated',
    message: `A ground-checking search has been created for your lost "${itemName}".`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyRecoveryStarted(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'RECOVERY_STARTED',
    title: 'Recovery search started',
    message: `A recovery officer has started searching for your lost "${itemName}".`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyPossibleMatch(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'POSSIBLE_MATCH',
    title: 'Possible match found',
    message: `A possible match has been found for your "${itemName}". Please review and verify ownership.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyOwnershipVerificationRequired(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'OWNERSHIP_VERIFICATION_REQUIRED',
    title: 'Ownership verification required',
    message: `Your ownership claim for "${itemName}" requires verification. Please provide identifying information.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyOwnershipVerified(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'OWNERSHIP_VERIFIED',
    title: 'Ownership verified',
    message: `Your ownership of "${itemName}" has been verified. The item is being prepared for collection.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyReadyForCollection(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'READY_FOR_COLLECTION',
    title: 'Item ready for collection',
    message: `Your "${itemName}" is ready for collection. Please check the collection details.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyItemHandedOver(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'ITEM_HANDED_OVER',
    title: 'Item handed over',
    message: `"${itemName}" has been handed over successfully.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyItemRecovered(itemId: string, userId: string, itemName: string) {
  await createNotification(prisma, {
    recipientId: userId,
    type: 'ITEM_RECOVERED',
    title: 'Item recovered',
    message: `Your "${itemName}" has been marked as recovered. Thank you for using Campus Lost & Found.`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}

export async function notifyRecoveryOfficers(db: LostFoundDb, itemId: string, itemName: string, campusArea: string) {
  const officers = await prisma.user.findMany({
    where: { role: 'RECOVERY_OFFICER', status: 'ACTIVE' },
    select: { id: true },
  });

  await Promise.all(
    officers.map((officer) =>
      createNotification(db, {
        recipientId: officer.id,
        type: 'RECOVERY_TASK_CREATED',
        title: 'New recovery task available',
        message: `A "${itemName}" needs recovery near ${campusArea}. Accept the task to begin ground checking.`,
        relatedEntity: 'LostFoundItem',
        relatedEntityId: itemId,
        actionUrl: `/recovery`,
        itemId,
      }),
    ),
  );
}

export async function notifyClaimSubmitted(itemId: string, reporterId: string, itemName: string, claimantName: string) {
  await createNotification(prisma, {
    recipientId: reporterId,
    type: 'CLAIM_SUBMITTED',
    title: 'New ownership claim',
    message: `${claimantName} has submitted an ownership claim for "${itemName}".`,
    relatedEntity: 'LostFoundItem',
    relatedEntityId: itemId,
    actionUrl: `/lost-found/${itemId}`,
    itemId,
  });
}
