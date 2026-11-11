'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import { requireUser } from '@/lib/auth/authorization';
import { decideRequest, JoinRequestServiceError } from '@/modules/join-requests';

export type DecisionActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function decideAction(
  _previousState: DecisionActionState,
  formData: FormData,
): Promise<DecisionActionState> {
  const slug = String(formData.get('slug') ?? '');

  try {
    const user = await requireUser();
    const decision = String(formData.get('decision') ?? '');
    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      return { status: 'error', message: 'Choose whether to approve or reject this request.' };
    }
    const input =
      decision === 'REJECT'
        ? {
            decision: 'REJECT' as const,
            note: String(formData.get('note') ?? ''),
            reason: String(formData.get('reason') ?? ''),
          }
        : { decision: 'APPROVE' as const, note: String(formData.get('note') ?? '') };
    await decideRequest(user, String(formData.get('requestId') ?? ''), input);
    revalidatePath(`/club-admin/${slug}/requests`);
    revalidatePath(`/club-admin/${slug}`);
    return { status: 'success', message: decision === 'REJECT' ? 'Request rejected.' : 'Request approved.' };
  } catch (error) {
    if (error instanceof ZodError) {
      const reasonError = error.issues.find((issue) => issue.path[0] === 'reason');
      if (reasonError) return { status: 'error', message: 'Add a rejection reason (at least 2 characters).' };
      return { status: 'error', message: 'Some request details are invalid. Refresh and try again.' };
    }

    if (error instanceof JoinRequestServiceError) {
      return {
        status: 'error',
        message:
          error.message === 'Another admin already decided this request'
            ? 'This request was already reviewed. Refresh to see its latest status.'
            : 'Could not update this request. Refresh the page and try again.',
      };
    }

    return {
      status: 'error',
      message: 'Could not update this request. Refresh the page and try again.',
    };
  }
}
