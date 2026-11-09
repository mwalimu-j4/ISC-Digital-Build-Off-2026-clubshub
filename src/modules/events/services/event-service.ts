import type { UserRole } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '@/lib/database/prisma';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { type EventDb, eventRepository } from '@/modules/events/repositories/event-repository';
import {
  eventActionSchema,
  eventIdSchema,
  eventInputSchema,
} from '@/modules/events/validations/event-schema';

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
  return eventRepository.findByIdForStudent(db, eventIdSchema.parse(eventId), actor.id);
}

export async function registerForEvent(actor: Actor, input: unknown, db: EventDb = prisma) {
  assertStudent(actor);
  const data = eventActionSchema.parse(input);
  if (data.action !== 'register') throw new EventServiceError('Invalid registration action');
  const event = await eventRepository.findById(db, data.eventId);
  if (!event || !['PUBLISHED', 'MEMBERS'].includes(event.status))
    throw new EventServiceError('Event is not available');
  if (
    event.status === 'MEMBERS' &&
    !(await eventRepository.findByIdForStudent(db, data.eventId, actor.id))
  ) {
    throw new EventServiceError('Approved club membership is required');
  }
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

type ClubAdminActor = { id: string };
const MAX_EVENT_MEDIA = 8;
const MAX_EVENT_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_EVENT_VIDEO_BYTES = 100 * 1024 * 1024;

const eventMediaFileSchema = z.custom<File>(
  (value) => value instanceof File && value.size > 0,
  'A valid media file is required',
);

async function uploadEventMedia(files: unknown[], clubId: string) {
  const parsedFiles = z.array(eventMediaFileSchema).max(MAX_EVENT_MEDIA).parse(files);
  return Promise.all(
    parsedFiles.map(async (file, sortOrder) => {
      const kind: 'IMAGE' | 'VIDEO' = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      const maxBytes = kind === 'VIDEO' ? MAX_EVENT_VIDEO_BYTES : MAX_EVENT_IMAGE_BYTES;
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        throw new EventServiceError('Only image and video files are allowed');
      }
      if (file.size > maxBytes) {
        throw new EventServiceError(
          `${kind === 'VIDEO' ? 'Video' : 'Image'} files exceed the allowed size`,
        );
      }
      const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), {
        folder: `clubshub/clubs/${clubId}/events`,
        resourceType: kind === 'VIDEO' ? 'video' : 'image',
      });
      return {
        kind,
        cloudinaryPublicId: result.publicId,
        url: result.url,
        width: result.width,
        height: result.height,
        durationSeconds: result.durationSeconds,
        bytes: result.bytes,
        sortOrder,
      };
    }),
  );
}

export async function listClubAdminEvents(
  actor: ClubAdminActor,
  clubSlug: string,
  status?: 'DRAFT' | 'MEMBERS' | 'PUBLISHED',
  db: EventDb = prisma,
) {
  return eventRepository.findForClubAdmin(db, actor.id, clubSlug, status);
}

export async function getClubAdminEvent(
  actor: ClubAdminActor,
  clubSlug: string,
  eventId: string,
  db: EventDb = prisma,
) {
  return eventRepository.findForClubAdminById(db, actor.id, clubSlug, eventIdSchema.parse(eventId));
}

export async function createClubAdminEvent(
  actor: ClubAdminActor,
  input: unknown,
  db: EventDb = prisma,
) {
  const raw = z.record(z.string(), z.unknown()).parse(input);
  const data = eventInputSchema.parse(raw);
  const club = await eventRepository.findClubAdminClub(db, actor.id, data.clubId);
  if (!club) throw new EventServiceError('Club-admin access is required');
  const media = await uploadEventMedia(
    z.array(z.unknown()).parse(raw.mediaFiles ?? []),
    data.clubId,
  );
  return eventRepository.createForClubAdmin(db, { ...data, media });
}

export async function updateClubAdminEvent(
  actor: ClubAdminActor,
  eventId: string,
  input: unknown,
  db: EventDb = prisma,
) {
  const raw = z.record(z.string(), z.unknown()).parse(input);
  const parsedInput = eventInputSchema.parse(raw);
  const data = eventInputSchema.omit({ clubId: true }).parse(parsedInput);
  const parsedEventId = eventIdSchema.parse(eventId);
  const result = await eventRepository.updateForClubAdmin(db, actor.id, parsedEventId, data);
  if (result.count !== 1) throw new EventServiceError('Event was not found or access was denied');
  const media = await uploadEventMedia(
    z.array(z.unknown()).parse(raw.mediaFiles ?? []),
    parsedInput.clubId,
  );
  if (media.length > 0) {
    const mediaResult = await eventRepository.addMediaForClubAdmin(
      db,
      actor.id,
      parsedEventId,
      media,
    );
    if (mediaResult.count !== 1) throw new EventServiceError('Event media could not be attached');
  }
}

export async function deleteClubAdminEvent(
  actor: ClubAdminActor,
  eventId: string,
  db: EventDb = prisma,
) {
  const result = await eventRepository.deleteForClubAdmin(
    db,
    actor.id,
    eventIdSchema.parse(eventId),
  );
  if (result.count !== 1) throw new EventServiceError('Event was not found or access was denied');
}
