'use client';

import { useState, useTransition } from 'react';

type Action = (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;

type Props = {
  userId: string;
  role: 'STUDENT' | 'SUPER_ADMIN' | null;
  status: 'ACTIVE' | 'SUSPENDED';
  updatedAt: string;
  changeRole: Action;
  suspend: Action;
  reactivate: Action;
};

export function UserActions({
  userId,
  role,
  status,
  updatedAt,
  changeRole,
  suspend,
  reactivate,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  function submit(action: Action, form: HTMLFormElement, confirmation?: string) {
    if (!form.reportValidity()) return;
    if (confirmation && !window.confirm(confirmation)) return;
    setError('');
    startTransition(async () => {
      const result = await action(new FormData(form));
      if (result.error) setError(result.error);
      else window.location.reload();
    });
  }

  return (
    <div className="users-actions">
      {error ? (
        <p className="users-action-error" role="alert">
          {error}
        </p>
      ) : null}
      {role ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const target = event.currentTarget;
            const nextRole = role === 'STUDENT' ? 'SUPER_ADMIN' : 'STUDENT';
            const confirmation =
              nextRole === 'SUPER_ADMIN'
                ? 'Promoting this user grants full platform access. Continue?'
                : 'Remove this user’s global super-admin access?';
            submit(changeRole, target, confirmation);
          }}
        >
          <input name="targetUserId" type="hidden" value={userId} />
          <input name="role" type="hidden" value={role === 'STUDENT' ? 'SUPER_ADMIN' : 'STUDENT'} />
          <input name="confirmation" type="hidden" value={role === 'STUDENT' ? 'PROMOTE' : ''} />
          <input name="expectedUpdatedAt" type="hidden" value={updatedAt} />
          <button className="users-button users-button-outline" disabled={pending} type="submit">
            Change role
          </button>
        </form>
      ) : (
        <p className="users-muted">This global role is managed outside this page.</p>
      )}
      {status === 'SUSPENDED' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(reactivate, event.currentTarget, 'Reactivate this account?');
          }}
        >
          <input name="targetUserId" type="hidden" value={userId} />
          <input name="expectedUpdatedAt" type="hidden" value={updatedAt} />
          <label className="users-field-label" htmlFor="reactivation-note">
            Reactivation note
          </label>
          <textarea
            id="reactivation-note"
            name="note"
            minLength={3}
            onChange={(event) => setNote(event.target.value)}
            required
            value={note}
          />
          <button className="users-button users-button-outline" disabled={pending} type="submit">
            Reactivate account
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(
              suspend,
              event.currentTarget,
              'Suspend this account? The reason will be audited.',
            );
          }}
        >
          <input name="targetUserId" type="hidden" value={userId} />
          <input name="expectedUpdatedAt" type="hidden" value={updatedAt} />
          <label className="users-field-label" htmlFor="suspension-reason">
            Reason for suspension
          </label>
          <textarea
            id="suspension-reason"
            name="reason"
            minLength={10}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Write at least 10 characters"
            required
            value={reason}
          />
          <button className="users-button users-button-danger" disabled={pending} type="submit">
            Suspend account
          </button>
        </form>
      )}
    </div>
  );
}
