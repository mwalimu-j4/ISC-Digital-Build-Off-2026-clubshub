'use client';

import { useActionState } from 'react';

import { DEPARTMENTS } from '@/modules/join-requests';

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
        School ID
        <input name="schoolId" required inputMode="text" maxLength={30} />
      </label>
      <label>
        Department
        <select defaultValue="" name="department" required>
          <option disabled value="">
            Select department
          </option>
          {DEPARTMENTS.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>
      </label>
      <label>
        Major
        <input name="major" required maxLength={80} />
      </label>
      <label>
        Year of study <span>(optional)</span>
        <input name="yearOfStudy" maxLength={20} />
      </label>
      <label>
        Why do you want to join? <span>(optional)</span>
        <textarea name="message" maxLength={280} rows={4} />
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
