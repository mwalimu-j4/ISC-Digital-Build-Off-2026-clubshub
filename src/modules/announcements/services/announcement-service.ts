import type { UserRole } from '@prisma/client';
import { z } from 'zod';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import {
  announcementAdminRepository,
  type AnnouncementDb,
  announcementRepository,
} from '@/modules/announcements/repositories/announcement-repository';
import {
  announcementIdSchema,
  announcementInputSchema,
} from '@/modules/announcements/validations/announcement-schema';
import { assertClubAdmin } from '@/modules/clubs/service';

export class AnnouncementServiceError extends Error {}

export async function listStudentAnnouncements(actor: { id: string; role: UserRole }) {
  if (actor.role !== 'STUDENT') throw new AnnouncementServiceError('Student access is required');
  return announcementRepository.findForStudent(prisma, actor.id);
}

type Actor = { id: string; role: UserRole };

async function ensureClubAdmin(db: AnnouncementDb, actor: Actor, clubId: string) {
  try {
    await assertClubAdmin(db, actor.id, clubId);
  } catch {
    throw new AnnouncementServiceError('Approved club-admin membership is required');
  }
}

async function resolveClubId(db: AnnouncementDb, actor: Actor, clubIdentifier: string) {
  if (z.string().uuid().safeParse(clubIdentifier).success) {
    await ensureClubAdmin(db, actor, clubIdentifier);
    return clubIdentifier;
  }

  if (!('club' in db) || !db.club || typeof db.club.findFirst !== 'function') {
    throw new AnnouncementServiceError('Approved club-admin membership is required');
  }

  const club = await db.club.findFirst({
    where: {
      slug: clubIdentifier,
      memberships: { some: { userId: actor.id, role: 'CLUB_ADMIN', status: 'APPROVED' } },
    },
    select: { id: true },
  });
  if (!club) throw new AnnouncementServiceError('Approved club-admin membership is required');
  return club.id;
}

export async function listClubAnnouncements(
  actor: Actor,
  clubSlug: string,
  db: AnnouncementDb = prisma,
) {
  const clubId = await resolveClubId(db, actor, clubSlug);
  return announcementAdminRepository.findForClubAdmin(db, clubId);
}

export async function createAnnouncement(
  actor: Actor,
  clubId: string,
  input: unknown,
  db: AnnouncementDb = prisma,
) {
  const parsedClubId = z.string().uuid().parse(clubId);
  const data = announcementInputSchema.parse(input);
  await ensureClubAdmin(db, actor, parsedClubId);
  const announcement = await announcementAdminRepository.createForClubAdmin(db, {
    clubId: parsedClubId,
    authorId: actor.id,
    ...data,
  });
  await recordAuditLog(db, {
    action: 'ANNOUNCEMENT_CREATED',
    actorId: actor.id,
    targetEntity: 'Announcement',
    targetEntityId: announcement.id,
  });
  return announcement;
}

export async function updateAnnouncement(
  actor: Actor,
  clubId: string,
  announcementId: string,
  input: unknown,
  db: AnnouncementDb = prisma,
) {
  const parsedClubId = z.string().uuid().parse(clubId);
  const parsedAnnouncementId = announcementIdSchema.parse(announcementId);
  const data = announcementInputSchema.parse(input);
  await ensureClubAdmin(db, actor, parsedClubId);
  const result = await announcementAdminRepository.updateForClubAdmin(
    db,
    parsedClubId,
    parsedAnnouncementId,
    { ...data },
  );
  if (result.count !== 1) {
    throw new AnnouncementServiceError('Announcement was not found or access was denied');
  }
  await recordAuditLog(db, {
    action: 'ANNOUNCEMENT_UPDATED',
    actorId: actor.id,
    targetEntity: 'Announcement',
    targetEntityId: parsedAnnouncementId,
  });
  return result;
}

export async function deleteAnnouncement(
  actor: Actor,
  clubId: string,
  announcementId: string,
  db: AnnouncementDb = prisma,
) {
  const parsedClubId = z.string().uuid().parse(clubId);
  const parsedAnnouncementId = announcementIdSchema.parse(announcementId);
  await ensureClubAdmin(db, actor, parsedClubId);
  const result = await announcementAdminRepository.deleteForClubAdmin(
    db,
    parsedClubId,
    parsedAnnouncementId,
  );
  if (result.count !== 1) {
    throw new AnnouncementServiceError('Announcement not found');
  }
  await recordAuditLog(db, {
    action: 'ANNOUNCEMENT_DELETED',
    actorId: actor.id,
    targetEntity: 'Announcement',
    targetEntityId: parsedAnnouncementId,
  });
  return result;
}
