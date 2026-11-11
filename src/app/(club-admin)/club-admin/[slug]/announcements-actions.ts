'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/authorization';
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from '@/modules/announcements';
import { announcementIdSchema } from '@/modules/announcements/validations/announcement-schema';

function readInput(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

export async function createAnnouncementAction(formData: FormData) {
  const actor = await requireUser();
  const slug = readInput(formData, 'slug');
  const clubId = readInput(formData, 'clubId');
  const payload = {
    title: readInput(formData, 'title'),
    body: readInput(formData, 'body'),
    audience: (readInput(formData, 'audience') || 'MEMBERS') as 'MEMBERS' | 'UNIVERSITY',
    pinned: readInput(formData, 'pinned') === 'true',
  };

  try {
    await createAnnouncement(actor, clubId, payload);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Check the announcement details and try again.'
        : error instanceof Error
          ? error.message
          : 'Check the announcement details and try again.';
    redirect(`/club-admin/${slug}/announcements/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/club-admin/${slug}/announcements`);
  redirect(`/club-admin/${slug}/announcements`);
}

export async function updateAnnouncementAction(formData: FormData) {
  const actor = await requireUser();
  const slug = readInput(formData, 'slug');
  const clubId = readInput(formData, 'clubId');
  const announcementId = announcementIdSchema.parse(readInput(formData, 'announcementId'));
  const payload = {
    title: readInput(formData, 'title'),
    body: readInput(formData, 'body'),
    audience: (readInput(formData, 'audience') || 'MEMBERS') as 'MEMBERS' | 'UNIVERSITY',
    pinned: readInput(formData, 'pinned') === 'true',
  };

  try {
    await updateAnnouncement(actor, clubId, announcementId, payload);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Check the announcement details and try again.'
        : error instanceof Error
          ? error.message
          : 'Check the announcement details and try again.';
    redirect(
      `/club-admin/${slug}/announcements/${announcementId}/edit?error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath(`/club-admin/${slug}/announcements`);
  redirect(`/club-admin/${slug}/announcements`);
}

export async function deleteAnnouncementAction(formData: FormData) {
  const actor = await requireUser();
  const slug = readInput(formData, 'slug');
  const clubId = readInput(formData, 'clubId');
  const announcementId = announcementIdSchema.parse(readInput(formData, 'announcementId'));

  try {
    await deleteAnnouncement(actor, clubId, announcementId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Announcement could not be deleted.';
    redirect(`/club-admin/${slug}/announcements?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/club-admin/${slug}/announcements`);
  redirect(`/club-admin/${slug}/announcements`);
}
