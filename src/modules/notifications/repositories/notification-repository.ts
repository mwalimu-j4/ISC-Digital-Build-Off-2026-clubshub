import type { Prisma, PrismaClient } from '@prisma/client';

export type NotificationDb = PrismaClient | Prisma.TransactionClient;

export const notificationRepository = {
  create(db: NotificationDb, data: Prisma.NotificationCreateInput) {
    return db.notification.create({ data });
  },
  findForUser(db: NotificationDb, userId: string) {
    return db.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
  markRead(db: NotificationDb, userId: string, id: string) {
    return db.notification.updateMany({
      where: { id, recipientId: userId },
      data: { read: true, readAt: new Date() },
    });
  },
  markAllRead(db: NotificationDb, userId: string) {
    return db.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  },
  unreadCount(db: NotificationDb, userId: string) {
    return db.notification.count({ where: { recipientId: userId, read: false } });
  },
};
