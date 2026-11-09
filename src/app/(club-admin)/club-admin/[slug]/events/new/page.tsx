import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ClubAdminEventForm } from '@/components/club-admin/event-form';
import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminOverview } from '@/modules/club-admin-overview';
import { createClubAdminEvent } from '@/modules/events';

function formInput(formData: FormData, clubId: string) {
  return {
    clubId,
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    location: String(formData.get('location') ?? ''),
    startsAt: String(formData.get('startsAt') ?? ''),
    endsAt: String(formData.get('endsAt') ?? ''),
    capacity: String(formData.get('capacity') ?? ''),
    registrationDeadline: String(formData.get('registrationDeadline') ?? ''),
    status: String(formData.get('status') ?? 'DRAFT'),
  };
}

export default async function NewClubAdminEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const overview = await getClubAdminOverview(user, slug);

  async function createEvent(formData: FormData) {
    'use server';
    const actor = await requireUser();
    const input = formInput(formData, overview.id);
    await createClubAdminEvent(actor, input);
    revalidatePath(`/club-admin/${slug}/events`);
    redirect(`/club-admin/${slug}/events`);
  }

  return (
    <div className="club-admin-content">
      <p className="club-admin-eyebrow">Events</p>
      <h1 className="club-admin-display">
        New <em>event</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminEventForm action={createEvent} submitLabel="Save event" />
      </section>
    </div>
  );
}
