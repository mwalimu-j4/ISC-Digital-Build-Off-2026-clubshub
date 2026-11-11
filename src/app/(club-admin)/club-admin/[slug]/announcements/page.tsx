import Link from 'next/link';

import { deleteAnnouncementAction } from '@/app/(club-admin)/club-admin/[slug]/announcements-actions';
import { requireUser } from '@/lib/auth/authorization';
import { listClubAnnouncements } from '@/modules/announcements';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  }).format(date);
}

export default async function ClubAdminAnnouncementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const { error } = await searchParams;
  const announcements = await listClubAnnouncements(user, slug);

  return (
    <div className="club-admin-content">
      <header className="club-admin-header">
        <div>
          <p className="club-admin-eyebrow">Announcements</p>
          <h1 className="club-admin-display">
            Your club <em>updates</em>
          </h1>
          <p className="club-admin-muted">
            Share time-sensitive updates with members or the wider university community.
          </p>
        </div>
        <Link className="club-admin-gold-button" href={`/club-admin/${slug}/announcements/new`}>
          + New announcement
        </Link>
      </header>

      {error ? (
        <p aria-live="polite" className="club-admin-form-error" role="alert">
          {error}
        </p>
      ) : null}

      {announcements.length === 0 ? (
        <section className="club-admin-panel club-admin-events-empty">
          <p className="club-admin-eyebrow">No announcements yet</p>
          <h2>Keep the club informed</h2>
          <p className="club-admin-muted">Publish an update to keep members informed.</p>
          <Link className="club-admin-navy-button" href={`/club-admin/${slug}/announcements/new`}>
            Create announcement
          </Link>
        </section>
      ) : (
        <section className="club-admin-events-list" aria-label="Club announcements">
          {announcements.map((announcement) => (
            <article className="club-admin-event-row" key={announcement.id}>
              <div>
                <span className="club-admin-event-status">
                  {announcement.pinned ? 'Pinned' : announcement.audience.toLowerCase()}
                </span>
                <h2>{announcement.title}</h2>
                <p>{announcement.body}</p>
                <small>{formatDate(announcement.createdAt)}</small>
              </div>
              <div className="club-admin-event-summary">
                {announcement.audience === 'UNIVERSITY' ? 'University-wide' : 'Members only'}
              </div>
              <div className="club-admin-event-actions">
                <Link
                  className="club-admin-outline-button"
                  href={`/club-admin/${slug}/announcements/${announcement.id}/edit`}
                >
                  Edit
                </Link>
                <form action={deleteAnnouncementAction}>
                  <input name="announcementId" type="hidden" value={announcement.id} />
                  <input name="clubId" type="hidden" value={announcement.clubId ?? ''} />
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
