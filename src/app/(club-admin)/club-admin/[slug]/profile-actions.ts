'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/authorization';
import { saveClubInterests } from '@/modules/discovery';

export async function saveClubInterestSettings(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get('slug') ?? '');
  const interestIds = formData.getAll('interestId').map(String);
  await saveClubInterests(user.id, slug, interestIds);
  revalidatePath('/');
  revalidatePath(`/clubs`);
  redirect(`/club-admin/${slug}/profile?saved=1`);
}
