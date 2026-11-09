'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/authorization';
import { changeUserRole, reactivateUser, suspendUser, UsersServiceError } from '@/modules/users';

type ActionResult = { error?: string; ok?: boolean };

function message(error: unknown) {
  if (error instanceof UsersServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return 'The action could not be completed';
}

export async function changeRoleAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireRole('SUPER_ADMIN');
    await changeUserRole(actor, {
      targetUserId: formData.get('targetUserId'),
      role: formData.get('role'),
      confirmation: formData.get('confirmation') || undefined,
      expectedUpdatedAt: formData.get('expectedUpdatedAt'),
    });
    revalidatePath('/super-admin/users');
    return { ok: true };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function suspendUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireRole('SUPER_ADMIN');
    await suspendUser(actor, {
      targetUserId: formData.get('targetUserId'),
      reason: formData.get('reason'),
      expectedUpdatedAt: formData.get('expectedUpdatedAt'),
    });
    revalidatePath('/super-admin/users');
    return { ok: true };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function reactivateUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const actor = await requireRole('SUPER_ADMIN');
    await reactivateUser(actor, {
      targetUserId: formData.get('targetUserId'),
      note: formData.get('note'),
      expectedUpdatedAt: formData.get('expectedUpdatedAt'),
    });
    revalidatePath('/super-admin/users');
    return { ok: true };
  } catch (error) {
    return { error: message(error) };
  }
}
