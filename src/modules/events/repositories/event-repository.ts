import type { PrismaClient } from '@prisma/client';

export type EventDb = PrismaClient;

const eventSelect = {
  id: true,
  title: true,
  description: true,
  location: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  registrationDeadline: true,
  status: true,
  club: { select: { id: true, name: true, slug: true, category: true } },
  _count: { select: { registrations: { where: { status: 'REGISTERED' as const } } } },
} as const;

export const eventRepository = {
  findClubAdminClub(db: EventDb, userId: string, clubId: string) {
    return db.club.findFirst({
      where: {
        id: clubId,
        memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } },
      },
      select: { id: true },
    });
  },
  findForClubAdmin(db: EventDb, userId: string, clubSlug: string, status?: 'DRAFT' | 'PUBLISHED') {
    return db.event.findMany({
      where: {
        status,
        club: {
          slug: clubSlug,
          memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } },
        },
      },
      select: {
        ...eventSelect,
        clubId: true,
      },
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });
  },
  findForClubAdminById(db: EventDb, userId: string, clubSlug: string, eventId: string) {
    return db.event.findFirst({
      where: {
        id: eventId,
        club: {
          slug: clubSlug,
          memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } },
        },
      },
      select: { ...eventSelect, clubId: true },
    });
  },
  createForClubAdmin(
    db: EventDb,
    data: {
      clubId: string;
      title: string;
      description: string;
      location: string;
      startsAt: Date;
      endsAt: Date;
      capacity: number | null;
      registrationDeadline: Date | null;
      status: 'DRAFT' | 'PUBLISHED';
    },
  ) {
    return db.event.create({
      data,
      select: eventSelect,
    });
  },
  updateForClubAdmin(
    db: EventDb,
    userId: string,
    eventId: string,
    data: {
      title: string;
      description: string;
      location: string;
      startsAt: Date;
      endsAt: Date;
      capacity: number | null;
      registrationDeadline: Date | null;
      status: 'DRAFT' | 'PUBLISHED';
    },
  ) {
    return db.event.updateMany({
      where: {
        id: eventId,
        club: { memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } } },
      },
      data,
    });
  },
  deleteForClubAdmin(db: EventDb, userId: string, eventId: string) {
    return db.event.deleteMany({
      where: {
        id: eventId,
        club: { memberships: { some: { userId, role: 'CLUB_ADMIN', status: 'APPROVED' } } },
      },
    });
  },
  findUpcoming(db: EventDb) {
    return db.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
      select: eventSelect,
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
  },
  findUpcomingForStudent(db: EventDb, _userId: string) {
    return db.event.findMany({
      where: {
        status: 'PUBLISHED',
        startsAt: { gte: new Date() },
      },
      select: eventSelect,
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
  },
  findById(db: EventDb, id: string) {
    return db.event.findUnique({ where: { id }, select: eventSelect });
  },
  findRegistration(db: EventDb, eventId: string, userId: string) {
    return db.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
  },
  countRegistrations(db: EventDb, eventId: string) {
    return db.eventRegistration.count({ where: { eventId, status: 'REGISTERED' } });
  },
  register(db: EventDb, eventId: string, userId: string) {
    return db.eventRegistration.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId },
      update: { status: 'REGISTERED' },
    });
  },
  updateRegistration(
    db: EventDb,
    eventId: string,
    userId: string,
    status: 'REGISTERED' | 'CANCELLED',
  ) {
    return db.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status },
    });
  },
  findRegisteredForUser(db: EventDb, userId: string) {
    return db.eventRegistration.findMany({
      where: {
        userId,
        status: 'REGISTERED',
        event: { startsAt: { gte: new Date() }, status: 'PUBLISHED' },
      },
      include: { event: { select: eventSelect } },
      orderBy: { event: { startsAt: 'asc' } },
      take: 1,
    });
  },
  countRegisteredForUser(db: EventDb, userId: string) {
    return db.eventRegistration.count({ where: { userId, status: 'REGISTERED' } });
  },
};
