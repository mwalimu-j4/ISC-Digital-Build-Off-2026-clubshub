import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { ClubAdminEventForm } from '@/components/club-admin/event-form';
import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminEvent, updateClubAdminEvent } from '@/modules/events';

export const dynamic = 'force-dynamic';

export default async function EditClubAdminEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; eventId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { slug, eventId } = await params;
  const { error } = await searchParams;
  const event = await getClubAdminEvent(user, slug, eventId);
  if (!event) notFound();
  const clubId = event.clubId;

  async function updateEvent(formData: FormData) {
    'use server';
    const actor = await requireUser();
    const startsDate = String(formData.get('startsDate') ?? '');
    const startsTime = String(formData.get('startsTime') ?? '');
    const endsDate = String(formData.get('endsDate') ?? '');
    const endsTime = String(formData.get('endsTime') ?? '');
    const registrationDate = String(formData.get('registrationDate') ?? '');
    const registrationTime = String(formData.get('registrationTime') ?? '');
    try {
      await updateClubAdminEvent(actor, eventId, {
        title: String(formData.get('title') ?? ''),
        clubId,
        description: String(formData.get('description') ?? ''),
        location: String(formData.get('location') ?? ''),
        startsAt: `${startsDate}T${startsTime}`,
        endsAt: `${endsDate}T${endsTime}`,
        capacity: String(formData.get('capacity') ?? ''),
        registrationDeadline:
          registrationDate && registrationTime ? `${registrationDate}T${registrationTime}` : '',
        status: String(formData.get('status') ?? 'DRAFT'),
        mediaFiles: formData.getAll('media'),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0]?.message ?? 'Check the event details and try again.';
        redirect(`/club-admin/${slug}/events/${eventId}/edit?error=${encodeURIComponent(message)}`);
      }
      throw error;
    }
    revalidatePath(`/club-admin/${slug}/events`);
    redirect(`/club-admin/${slug}/events`);
  }

  return (
    <div className="club-admin-content club-admin-editor-page">
      <Link className="club-admin-back-link" href={`/club-admin/${slug}/events`}>
        ← Back to events
      </Link>
      <p className="club-admin-eyebrow">Events</p>
      <h1 className="club-admin-display">
        Edit <em>event</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminEventForm
          action={updateEvent}
          submitLabel="Save changes"
          error={error}
          values={{
            ...event,
            status:
              event.status === 'PUBLISHED'
                ? 'PUBLISHED'
                : event.status === 'MEMBERS'
                  ? 'MEMBERS'
                  : 'DRAFT',
          }}
        />
      </section>
    </div>
  );
}
