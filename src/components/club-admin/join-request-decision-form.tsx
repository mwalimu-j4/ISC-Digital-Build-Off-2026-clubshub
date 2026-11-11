'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import type { DecisionActionState } from '@/app/(club-admin)/club-admin/[slug]/requests/actions';

const initialState: DecisionActionState = { status: 'idle' };

export function JoinRequestDecisionForm({
  action,
  requestId,
  slug,
}: {
  action: (state: DecisionActionState, formData: FormData) => Promise<DecisionActionState>;
  requestId: string;
  slug: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === 'success') toast.success(state.message);
    if (state.status === 'error') toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="join-request-decision">
      <input name="requestId" type="hidden" value={requestId} />
      <input name="slug" type="hidden" value={slug} />
      <label>
        Note to the applicant
        <textarea
          disabled={pending}
          maxLength={200}
          name="note"
          placeholder="Add a warm welcome or helpful context."
          rows={3}
        />
      </label>
      <label>
        Rejection reason{' '}
        <input
          disabled={pending}
          maxLength={120}
          name="reason"
          placeholder="Required only when rejecting"
        />
      </label>
      {state.status === 'error' ? (
        <p className="join-request-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="join-request-actions">
        <button
          className="club-admin-gold-button"
          disabled={pending}
          name="decision"
          type="submit"
          value="APPROVE"
        >
          {pending ? 'Updating…' : 'Approve'}
        </button>
        <button
          className="join-request-reject"
          disabled={pending}
          name="decision"
          type="submit"
          value="REJECT"
        >
          {pending ? 'Updating…' : 'Reject with reason'}
        </button>
      </div>
    </form>
  );
}
