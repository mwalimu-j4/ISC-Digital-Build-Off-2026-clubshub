'use client';

import { useActionState } from 'react';

type FormState = { error?: string; success?: boolean };
type SubmitAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function JoinRequestForm({ clubId, action }: { clubId: string; action: SubmitAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="join-request-form" noValidate>
      <input name="clubId" type="hidden" value={clubId} />
      {state.error ? (
        <p className="join-request-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="join-request-success" role="status">
          Request sent. Your request is now pending.
        </p>
      ) : null}
      <label>
        Full name
        <input name="fullName" required maxLength={160} autoComplete="name" />
      </label>
      <label>
        School ID
        <input name="schoolId" required inputMode="text" maxLength={30} />
      </label>
      <label>
        Department
        <input name="department" required maxLength={120} />
      </label>
      <label>
        Major
        <input name="major" required maxLength={80} />
      </label>
      <label className="join-request-checkbox">
        <input defaultChecked name="saveDetails" type="checkbox" />
        Save these details for my other clubs
      </label>
      <p className="join-request-privacy">
        Your school ID is only visible to admins of this club and is never shown publicly.
      </p>
      <button className="club-admin-gold-button" disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}
