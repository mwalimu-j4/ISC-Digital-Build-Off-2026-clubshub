import type { NotificationType, UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import {
  type NotificationDb,
  notificationRepository,
} from '@/modules/notifications/repositories/notification-repository';
import { notificationActionSchema } from '@/modules/notifications/validations/notification-schema';

export class NotificationServiceError extends Error {}

type Actor = { id: string; role: UserRole };

export async function createNotification(
  params: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
  },
  db: NotificationDb = prisma,
) {
  return notificationRepository.create(db, {
    recipient: { connect: { id: params.recipientId } },
    type: params.type,
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
  });
}

export async function listNotifications(actor: Actor) {
  if (actor.role !== 'STUDENT') throw new NotificationServiceError('Student access is required');
  return notificationRepository.findForUser(prisma, actor.id);
}

export async function getUnreadNotificationCount(actor: Actor) {
  if (actor.role !== 'STUDENT') throw new NotificationServiceError('Student access is required');
  return notificationRepository.unreadCount(prisma, actor.id);
}

export async function updateNotifications(actor: Actor, input: unknown) {
  if (actor.role !== 'STUDENT') throw new NotificationServiceError('Student access is required');
  const data = notificationActionSchema.parse(input);
  if (data.action === 'mark-all-read') return notificationRepository.markAllRead(prisma, actor.id);
  if (!data.id) throw new NotificationServiceError('Notification id is required');
  return notificationRepository.markRead(prisma, actor.id, data.id);
}
