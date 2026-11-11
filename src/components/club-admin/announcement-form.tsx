'use client';

import { type FormHTMLAttributes, useState } from 'react';

type AnnouncementFormValues = {
  clubId?: string;
  slug?: string;
  announcementId?: string;
  title?: string;
  body?: string;
  audience?: 'MEMBERS' | 'UNIVERSITY';
  pinned?: boolean;
};

export function ClubAdminAnnouncementForm({
  action,
  values = {},
  submitLabel,
  error,
}: {
  action: FormHTMLAttributes<HTMLFormElement>['action'];
  values?: AnnouncementFormValues;
  submitLabel: string;
  error?: string;
}) {
  const [formError] = useState(error);

  return (
    <form action={action} className="club-admin-event-form">
      {formError ? (
        <p aria-live="polite" className="club-admin-form-error" role="alert">
          {formError}
        </p>
      ) : null}
      {values.clubId ? <input name="clubId" type="hidden" value={values.clubId} /> : null}
      {values.slug ? <input name="slug" type="hidden" value={values.slug} /> : null}
      {values.announcementId ? (
        <input name="announcementId" type="hidden" value={values.announcementId} />
      ) : null}
      <label>
        Title
        <input
          defaultValue={values.title ?? ''}
          maxLength={120}
          minLength={3}
          name="title"
          required
          type="text"
        />
      </label>
      <label>
        Message
        <textarea
          defaultValue={values.body ?? ''}
          maxLength={5000}
          minLength={1}
          name="body"
          required
          rows={7}
        />
      </label>
      <fieldset className="club-admin-visibility-grid">
        <legend>Who should see this announcement?</legend>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.audience === 'MEMBERS' || !values.audience}
            name="audience"
            type="radio"
            value="MEMBERS"
          />
          Members only <span>Shared with club members.</span>
        </label>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.audience === 'UNIVERSITY'}
            name="audience"
            type="radio"
            value="UNIVERSITY"
          />
          University-wide <span>Visible across campus and student feeds.</span>
        </label>
      </fieldset>
      <label className="club-admin-event-choice" htmlFor="announcement-pinned">
        <input
          defaultChecked={values.pinned ?? false}
          id="announcement-pinned"
          name="pinned"
          type="checkbox"
          value="true"
        />
        Pin this announcement
      </label>
      <button className="club-admin-gold-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
