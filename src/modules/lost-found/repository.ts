import type { LostFoundCategory, LostFoundStatus, LostFoundType, Prisma, PrismaClient } from '@prisma/client';

export type LostFoundDb = PrismaClient | Prisma.TransactionClient;

const publicItemSelect = {
  id: true,
  reportType: true,
  status: true,
  category: true,
  name: true,
  description: true,
  color: true,
  brand: true,
  campusArea: true,
  building: true,
  specificLocation: true,
  dateOccurred: true,
  timeOccurred: true,
  images: true,
  itemCondition: true,
  referenceCode: true,
  createdAt: true,
  reportedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.LostFoundItemSelect;

const detailItemSelect = {
  ...publicItemSelect,
  model: true,
  distinguishing: true,
  serialNumber: true,
  locationNotes: true,
  currentHolding: true,
  collectionLocation: true,
  collectionDeadline: true,
  reportedById: true,
  updatedAt: true,
  statusHistory: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      status: true,
      note: true,
      evidence: true,
      createdAt: true,
      actor: { select: { id: true, fullName: true } },
    },
  },
  recoveryTask: {
    select: {
      id: true,
      priority: true,
      status: true,
      searchNotes: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      assignedTo: { select: { id: true, fullName: true } },
      checkpoints: {
        orderBy: { createdAt: 'asc' as const },
        select: {
          id: true,
          areaName: true,
          searched: true,
          notes: true,
          searchedAt: true,
          searchedBy: { select: { id: true, fullName: true } },
        },
      },
    },
  },
  matchesAsLost: {
    orderBy: { score: 'desc' as const },
    select: {
      id: true,
      score: true,
      status: true,
      notes: true,
      createdAt: true,
      foundItem: {
        select: { id: true, name: true, category: true, campusArea: true, building: true, images: true, dateOccurred: true, status: true },
      },
    },
  },
  matchesAsFound: {
    orderBy: { score: 'desc' as const },
    select: {
      id: true,
      score: true,
      status: true,
      notes: true,
      createdAt: true,
      lostItem: {
        select: { id: true, name: true, category: true, campusArea: true, building: true, images: true, dateOccurred: true, status: true },
      },
    },
  },
  claims: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      status: true,
      rejectionReason: true,
      handedOverAt: true,
      createdAt: true,
      claimant: { select: { id: true, fullName: true } },
      verifiedBy: { select: { id: true, fullName: true } },
    },
  },
} satisfies Prisma.LostFoundItemSelect;

export const lostFoundRepository = {
  create(db: LostFoundDb, data: Prisma.LostFoundItemCreateInput) {
    return db.lostFoundItem.create({ data, select: publicItemSelect });
  },

  findById(db: LostFoundDb, id: string) {
    return db.lostFoundItem.findUnique({ where: { id }, select: detailItemSelect });
  },

  findList(
    db: LostFoundDb,
    filters: {
      reportType?: LostFoundType;
      status?: LostFoundStatus;
      category?: LostFoundCategory;
      campusArea?: string;
      search?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    const where: Prisma.LostFoundItemWhereInput = {};
    if (filters.reportType) where.reportType = filters.reportType;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.campusArea) where.campusArea = filters.campusArea;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { campusArea: { contains: filters.search, mode: 'insensitive' } },
        { building: { contains: filters.search, mode: 'insensitive' } },
        { referenceCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const limit = Math.min(filters.limit ?? 20, 50);

    return db.lostFoundItem.findMany({
      where,
      select: publicItemSelect,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
    });
  },

  findByUser(db: LostFoundDb, userId: string) {
    return db.lostFoundItem.findMany({
      where: { reportedById: userId },
      select: publicItemSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus(db: LostFoundDb, id: string, status: LostFoundStatus) {
    return db.lostFoundItem.update({ where: { id }, data: { status } });
  },

  updateItem(db: LostFoundDb, id: string, data: Prisma.LostFoundItemUpdateInput) {
    return db.lostFoundItem.update({ where: { id }, data });
  },

  countByStatus(db: LostFoundDb) {
    return db.lostFoundItem.groupBy({
      by: ['reportType', 'status'],
      _count: { id: true },
    });
  },

  findMatchCandidates(
    db: LostFoundDb,
    item: { id: string; category: LostFoundCategory; campusArea: string; dateOccurred: Date },
    type: LostFoundType,
  ) {
    const oppositeType = type === 'LOST' ? 'FOUND' : 'LOST';
    const dateRange = new Date(item.dateOccurred);
    const dateBefore = new Date(dateRange);
    dateBefore.setDate(dateBefore.getDate() - 14);
    const dateAfter = new Date(dateRange);
    dateAfter.setDate(dateAfter.getDate() + 14);

    return db.lostFoundItem.findMany({
      where: {
        reportType: oppositeType,
        id: { not: item.id },
        status: { in: ['VERIFIED', 'PENDING_REVIEW'] },
        category: item.category,
        dateOccurred: { gte: dateBefore, lte: dateAfter },
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        color: true,
        brand: true,
        model: true,
        campusArea: true,
        building: true,
        dateOccurred: true,
        images: true,
      },
    });
  },
};

export const recoveryTaskRepository = {
  create(db: LostFoundDb, data: Prisma.RecoveryTaskCreateInput) {
    return db.recoveryTask.create({ data });
  },

  findById(db: LostFoundDb, id: string) {
    return db.recoveryTask.findUnique({
      where: { id },
      include: {
        item: { select: { ...publicItemSelect, locationNotes: true, distinguishing: true, serialNumber: true, reportedById: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        checkpoints: {
          orderBy: { createdAt: 'asc' },
          include: { searchedBy: { select: { id: true, fullName: true } } },
        },
      },
    });
  },

  findActive(db: LostFoundDb, assignedToId?: string) {
    const where: Prisma.RecoveryTaskWhereInput = {
      status: { in: ['PENDING', 'IN_PROGRESS', 'ESCALATED'] },
    };
    if (assignedToId) where.assignedToId = assignedToId;
    return db.recoveryTask.findMany({
      where,
      include: {
        item: { select: publicItemSelect },
        assignedTo: { select: { id: true, fullName: true } },
        checkpoints: { select: { id: true, searched: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  },

  update(db: LostFoundDb, id: string, data: Prisma.RecoveryTaskUpdateInput) {
    return db.recoveryTask.update({ where: { id }, data });
  },
};

export const checkpointRepository = {
  create(db: LostFoundDb, data: Prisma.RecoveryCheckpointCreateInput) {
    return db.recoveryCheckpoint.create({ data });
  },

  update(db: LostFoundDb, id: string, data: Prisma.RecoveryCheckpointUpdateInput) {
    return db.recoveryCheckpoint.update({ where: { id }, data });
  },
};

export const matchRepository = {
  create(db: LostFoundDb, data: Prisma.LostFoundMatchCreateInput) {
    return db.lostFoundMatch.create({ data });
  },

  findByItems(db: LostFoundDb, lostItemId: string, foundItemId: string) {
    return db.lostFoundMatch.findUnique({
      where: { lostItemId_foundItemId: { lostItemId, foundItemId } },
    });
  },

  update(db: LostFoundDb, id: string, data: Prisma.LostFoundMatchUpdateInput) {
    return db.lostFoundMatch.update({ where: { id }, data });
  },
};

export const claimRepository = {
  create(db: LostFoundDb, data: Prisma.LostFoundClaimCreateInput) {
    return db.lostFoundClaim.create({ data });
  },

  findById(db: LostFoundDb, id: string) {
    return db.lostFoundClaim.findUnique({
      where: { id },
      include: {
        claimant: { select: { id: true, fullName: true, email: true } },
        item: { select: publicItemSelect },
      },
    });
  },

  update(db: LostFoundDb, id: string, data: Prisma.LostFoundClaimUpdateInput) {
    return db.lostFoundClaim.update({ where: { id }, data });
  },
};

export const notificationRepository = {
  create(db: LostFoundDb, data: Prisma.NotificationCreateInput) {
    return db.notification.create({ data });
  },

  findByUser(db: LostFoundDb, userId: string, limit = 20) {
    return db.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  countUnread(db: LostFoundDb, userId: string) {
    return db.notification.count({ where: { recipientId: userId, read: false } });
  },

  markRead(db: LostFoundDb, id: string, userId: string) {
    return db.notification.updateMany({
      where: { id, recipientId: userId },
      data: { read: true, readAt: new Date() },
    });
  },

  markAllRead(db: LostFoundDb, userId: string) {
    return db.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  },
};
