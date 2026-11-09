import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/authorization';
import { deleteClubAdminEvent, listClubAdminEvents } from '@/modules/events';
import { eventIdSchema } from '@/modules/events/validations/event-schema';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(date);
}

async function deleteEvent(formData: FormData) {
  'use server';
  const user = await requireUser();
  const slug = String(formData.get('slug'));
  const eventId = eventIdSchema.parse(String(formData.get('eventId')));
  await deleteClubAdminEvent(user, eventId);
  revalidatePath(`/club-admin/${slug}/events`);
  redirect(`/club-admin/${slug}/events`);
}

export default async function ClubAdminEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const statusParam = (await searchParams).status;
  const status =
    statusParam === 'DRAFT' || statusParam === 'MEMBERS' || statusParam === 'PUBLISHED'
      ? statusParam
      : undefined;
  const events = await listClubAdminEvents(user, slug, status);

  return (
    <div className="club-admin-content">
      <header className="club-admin-header">
        <div>
          <p className="club-admin-eyebrow">Events</p>
          <h1 className="club-admin-display">
            Your club <em>events</em>
          </h1>
          <p className="club-admin-muted">Create, publish, and manage your club&apos;s events.</p>
        </div>
        <Link className="club-admin-gold-button" href={`/club-admin/${slug}/events/new`}>
          + New event
        </Link>
      </header>
      <nav aria-label="Event filters" className="club-admin-event-filters">
        <Link className={!status ? 'active' : ''} href={`/club-admin/${slug}/events`}>
          All
        </Link>
        <Link className={status === 'PUBLISHED' ? 'active' : ''} href={`?status=PUBLISHED`}>
          Everyone
        </Link>
        <Link className={status === 'MEMBERS' ? 'active' : ''} href="?status=MEMBERS">
          Members only
        </Link>
        <Link className={status === 'DRAFT' ? 'active' : ''} href={`?status=DRAFT`}>
          Drafts
        </Link>
      </nav>
      {events.length === 0 ? (
        <section className="club-admin-panel club-admin-events-empty">
          <p className="club-admin-eyebrow">No events yet</p>
          <h2>Create your first event</h2>
          <p className="club-admin-muted">Give students something to look forward to.</p>
          <Link className="club-admin-navy-button" href={`/club-admin/${slug}/events/new`}>
            Create event
          </Link>
        </section>
      ) : (
        <section className="club-admin-events-list" aria-label="Club events">
          {events.map((event) => (
            <article className="club-admin-event-row" key={event.id}>
              <div>
                <span className={`club-admin-event-status ${event.status.toLowerCase()}`}>
                  {event.status === 'PUBLISHED'
                    ? 'Everyone'
                    : event.status === 'MEMBERS'
                      ? 'Members only'
                      : 'Draft'}
                </span>
                <h2>{event.title}</h2>
                <p>
                  {formatDate(event.startsAt)} · {event.location}
                </p>
              </div>
              <div className="club-admin-event-summary">
                {event._count.registrations}
                {event.capacity ? ` of ${event.capacity}` : ''} registered
              </div>
              <div className="club-admin-event-actions">
                <Link
                  className="club-admin-outline-button"
                  href={`/club-admin/${slug}/events/${event.id}/edit`}
                >
                  Edit
                </Link>
                <form action={deleteEvent}>
                  <input name="eventId" type="hidden" value={event.id} />
                  <input name="slug" type="hidden" value={slug} />
                  <button className="club-admin-delete-button" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
