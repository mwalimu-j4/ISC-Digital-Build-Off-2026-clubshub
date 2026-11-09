import type { FormHTMLAttributes } from 'react';

type EventFormValues = {
  title?: string;
  description?: string;
  location?: string;
  startsAt?: Date;
  endsAt?: Date;
  capacity?: number | null;
  registrationDeadline?: Date | null;
  status?: 'DRAFT' | 'PUBLISHED';
};

function dateValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 16) : '';
}

export function ClubAdminEventForm({
  action,
  values = {},
  submitLabel,
}: {
  action: FormHTMLAttributes<HTMLFormElement>['action'];
  values?: EventFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="club-admin-event-form">
      <label>
        Title
        <input defaultValue={values.title} name="title" required minLength={3} maxLength={120} />
      </label>
      <div className="club-admin-event-form-grid">
        <label>
          Starts (EAT)
          <input
            defaultValue={dateValue(values.startsAt)}
            name="startsAt"
            required
            type="datetime-local"
          />
        </label>
        <label>
          Ends (EAT)
          <input
            defaultValue={dateValue(values.endsAt)}
            name="endsAt"
            required
            type="datetime-local"
          />
        </label>
      </div>
      <label>
        Venue or https link
        <input defaultValue={values.location} name="location" required maxLength={200} />
      </label>
      <label>
        Description
        <textarea defaultValue={values.description} name="description" rows={6} maxLength={5000} />
      </label>
      <div className="club-admin-event-form-grid">
        <label>
          Capacity (optional)
          <input defaultValue={values.capacity ?? ''} min={1} name="capacity" type="number" />
        </label>
        <label>
          Registration closes (optional)
          <input
            defaultValue={dateValue(values.registrationDeadline)}
            name="registrationDeadline"
            type="datetime-local"
          />
        </label>
      </div>
      <fieldset>
        <legend>Who can see this event?</legend>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.status !== 'PUBLISHED'}
            name="status"
            type="radio"
            value="DRAFT"
          />
          Draft <span>Only club admins can see it.</span>
        </label>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.status === 'PUBLISHED'}
            name="status"
            type="radio"
            value="PUBLISHED"
          />
          Everyone <span>Shown to students and visitors.</span>
        </label>
      </fieldset>
      <button className="club-admin-gold-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
