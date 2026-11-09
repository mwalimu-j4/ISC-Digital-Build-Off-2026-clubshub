import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ClubAdminEventForm } from '@/components/club-admin/event-form';
import { requireUser } from '@/lib/auth/authorization';
import { CloudinaryUploadError } from '@/lib/utils/cloudinary';
import { getClubAdminOverview } from '@/modules/club-admin-overview';
import { createClubAdminEvent } from '@/modules/events';

function formInput(formData: FormData, clubId: string) {
  const startsDate = String(formData.get('startsDate') ?? '');
  const startsTime = String(formData.get('startsTime') ?? '');
  const endsDate = String(formData.get('endsDate') ?? '');
  const endsTime = String(formData.get('endsTime') ?? '');
  const registrationDate = String(formData.get('registrationDate') ?? '');
  const registrationTime = String(formData.get('registrationTime') ?? '');
  return {
    clubId,
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    location: String(formData.get('location') ?? ''),
    startsAt: `${startsDate}T${startsTime}`,
    endsAt: `${endsDate}T${endsTime}`,
    capacity: String(formData.get('capacity') ?? ''),
    registrationDeadline:
      registrationDate && registrationTime ? `${registrationDate}T${registrationTime}` : '',
    status: String(formData.get('status') ?? 'DRAFT'),
  };
}

export default async function NewClubAdminEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const { error } = await searchParams;
  const overview = await getClubAdminOverview(user, slug);

  async function createEvent(formData: FormData) {
    'use server';
    const actor = await requireUser();
    const input = formInput(formData, overview.id);
    try {
      await createClubAdminEvent(actor, { ...input, mediaFiles: formData.getAll('media') });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0]?.message ?? 'Check the event details and try again.';
        redirect(`/club-admin/${slug}/events/new?error=${encodeURIComponent(message)}`);
      }
      if (error instanceof CloudinaryUploadError) {
        redirect(
          `/club-admin/${slug}/events/new?error=${encodeURIComponent(
            'Media upload failed. Check the selected file and try again.',
          )}`,
        );
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
        New <em>event</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminEventForm
          action={createEvent}
          submitLabel="Save event"
          error={error}
          values={{ clubId: overview.id }}
        />
      </section>
    </div>
  );
}
