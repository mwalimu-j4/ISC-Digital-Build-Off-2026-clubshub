import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

import { ClubAdminEventForm } from '@/components/club-admin/event-form';
import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminEvent, updateClubAdminEvent } from '@/modules/events';

export const dynamic = 'force-dynamic';

export default async function EditClubAdminEventPage({
  params,
}: {
  params: Promise<{ slug: string; eventId: string }>;
}) {
  const user = await requireUser();
  const { slug, eventId } = await params;
  const event = await getClubAdminEvent(user, slug, eventId);
  if (!event) notFound();

  async function updateEvent(formData: FormData) {
    'use server';
    const actor = await requireUser();
    await updateClubAdminEvent(actor, eventId, {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      location: String(formData.get('location') ?? ''),
      startsAt: String(formData.get('startsAt') ?? ''),
      endsAt: String(formData.get('endsAt') ?? ''),
      capacity: String(formData.get('capacity') ?? ''),
      registrationDeadline: String(formData.get('registrationDeadline') ?? ''),
      status: String(formData.get('status') ?? 'DRAFT'),
    });
    revalidatePath(`/club-admin/${slug}/events`);
    redirect(`/club-admin/${slug}/events`);
  }

  return (
    <div className="club-admin-content">
      <p className="club-admin-eyebrow">Events</p>
      <h1 className="club-admin-display">
        Edit <em>event</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminEventForm
          action={updateEvent}
          submitLabel="Save changes"
          values={{ ...event, status: event.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT' }}
        />
      </section>
    </div>
  );
}
