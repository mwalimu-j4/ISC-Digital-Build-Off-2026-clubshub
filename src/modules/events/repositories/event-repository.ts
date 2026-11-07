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
  findUpcoming(db: EventDb) {
    return db.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
      select: eventSelect,
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
  },
  findUpcomingForStudent(db: EventDb, userId: string) {
    return db.event.findMany({
      where: {
        status: 'PUBLISHED',
        startsAt: { gte: new Date() },
        OR: [
          { registrations: { some: { userId, status: 'REGISTERED' } } },
          { club: { memberships: { some: { userId, status: 'APPROVED' } } } },
        ],
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
