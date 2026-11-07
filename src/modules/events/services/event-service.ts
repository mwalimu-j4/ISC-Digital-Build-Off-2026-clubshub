import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { type EventDb, eventRepository } from '@/modules/events/repositories/event-repository';
import { eventActionSchema, eventIdSchema } from '@/modules/events/validations/event-schema';

export class EventServiceError extends Error {}

type Actor = { id: string; role: UserRole };

function assertStudent(actor: Actor) {
  if (actor.role !== 'STUDENT') throw new EventServiceError('Student access is required');
}

export async function listUpcomingEvents(actor: Actor, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.findUpcoming(db);
}

export async function listStudentWeekEvents(actor: Actor, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.findUpcomingForStudent(db, actor.id);
}

export async function getEvent(actor: Actor, eventId: string, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.findById(db, eventIdSchema.parse(eventId));
}

export async function registerForEvent(actor: Actor, input: unknown, db: EventDb = prisma) {
  assertStudent(actor);
  const data = eventActionSchema.parse(input);
  if (data.action !== 'register') throw new EventServiceError('Invalid registration action');
  const event = await eventRepository.findById(db, data.eventId);
  if (!event || event.status !== 'PUBLISHED') throw new EventServiceError('Event is not available');
  if (event.registrationDeadline && event.registrationDeadline < new Date())
    throw new EventServiceError('Registration is closed');
  if (event.capacity !== null) {
    const registered = await eventRepository.countRegistrations(db, data.eventId);
    if (registered >= event.capacity)
      throw new EventServiceError('Event capacity has been reached');
  }
  const existing = await eventRepository.findRegistration(db, data.eventId, actor.id);
  if (existing?.status === 'REGISTERED') throw new EventServiceError('Already registered');
  return eventRepository.register(db, data.eventId, actor.id);
}

export async function cancelEventRegistration(actor: Actor, input: unknown, db: EventDb = prisma) {
  assertStudent(actor);
  const data = eventActionSchema.parse(input);
  if (data.action !== 'cancel') throw new EventServiceError('Invalid cancellation action');
  const existing = await eventRepository.findRegistration(db, data.eventId, actor.id);
  if (!existing || existing.status !== 'REGISTERED')
    throw new EventServiceError('Registration not found');
  return eventRepository.updateRegistration(db, data.eventId, actor.id, 'CANCELLED');
}

export async function getNextRegisteredEvent(actor: Actor, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.findRegisteredForUser(db, actor.id);
}

export async function getEventRegistration(actor: Actor, eventId: string, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.findRegistration(db, eventIdSchema.parse(eventId), actor.id);
}

export async function getRegisteredEventCount(actor: Actor, db: EventDb = prisma) {
  assertStudent(actor);
  return eventRepository.countRegisteredForUser(db, actor.id);
}
