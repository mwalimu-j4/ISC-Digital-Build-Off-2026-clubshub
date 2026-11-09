'use client';

import { type ChangeEvent, type FormHTMLAttributes, useState } from 'react';

type EventFormValues = {
  clubId?: string;
  title?: string;
  description?: string;
  location?: string;
  startsAt?: Date;
  endsAt?: Date;
  capacity?: number | null;
  registrationDeadline?: Date | null;
  status?: 'DRAFT' | 'MEMBERS' | 'PUBLISHED';
};

function parts(value?: Date | null) {
  if (!value) return { date: '', time: '' };
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    formatted.find((part) => part.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
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
  const starts = parts(values.startsAt);
  const ends = parts(values.endsAt);
  const registration = parts(values.registrationDeadline);
  const [files, setFiles] = useState<File[]>([]);
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []).slice(0, 8));
  };

  return (
    <form action={action} className="club-admin-event-form" encType="multipart/form-data">
      {values.clubId ? <input name="clubId" type="hidden" value={values.clubId} /> : null}
      <label>
        Title
        <input defaultValue={values.title} name="title" required minLength={3} maxLength={120} />
      </label>
      <div className="club-admin-event-form-grid">
        <label>
          Start date
          <input defaultValue={starts.date} name="startsDate" required type="date" />
          <span className="club-admin-field-help">Africa/Nairobi (EAT)</span>
        </label>
        <label>
          Start time
          <input defaultValue={starts.time} name="startsTime" required type="time" />
        </label>
        <label>
          End date
          <input defaultValue={ends.date} name="endsDate" required type="date" />
        </label>
        <label>
          End time
          <input defaultValue={ends.time} name="endsTime" required type="time" />
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
          <input defaultValue={registration.date} name="registrationDate" type="date" />
          <span className="club-admin-field-help">Optional, in EAT</span>
        </label>
        <label>
          Registration closes at
          <input defaultValue={registration.time} name="registrationTime" type="time" />
        </label>
      </div>
      <fieldset className="club-admin-visibility-grid">
        <legend>Who can see this event?</legend>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.status === 'DRAFT' || !values.status}
            name="status"
            type="radio"
            value="DRAFT"
          />
          Draft <span>Only club admins can see it.</span>
        </label>
        <label className="club-admin-event-choice">
          <input
            defaultChecked={values.status === 'MEMBERS'}
            name="status"
            type="radio"
            value="MEMBERS"
          />
          Members only <span>Shown to approved members of this club.</span>
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
      <label className="club-admin-media-dropzone">
        <span>
          Photos or videos <small>Optional · up to 8 files</small>
        </span>
        <input accept="image/*,video/*" multiple name="media" onChange={handleFiles} type="file" />
        <strong>Choose images or videos</strong>
        <span className="club-admin-field-help">
          JPG, PNG, WebP, MP4, MOV · uploaded securely when you save
        </span>
      </label>
      {files.length > 0 ? (
        <ul className="club-admin-media-list" aria-label="Selected media">
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`}>
              <span>{file.type.startsWith('video/') ? 'Video' : 'Image'}</span>
              {file.name}
            </li>
          ))}
        </ul>
      ) : null}
      <button className="club-admin-gold-button" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
