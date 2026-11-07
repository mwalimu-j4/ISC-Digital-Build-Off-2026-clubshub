import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { announcementRepository } from '@/modules/announcements/repositories/announcement-repository';

export class AnnouncementServiceError extends Error {}

export async function listStudentAnnouncements(actor: { id: string; role: UserRole }) {
  if (actor.role !== 'STUDENT') throw new AnnouncementServiceError('Student access is required');
  return announcementRepository.findForStudent(prisma, actor.id);
}
