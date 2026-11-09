import Link from 'next/link';

import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminOverview } from '@/modules/club-admin-overview';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date);
}

function formatRelative(date: Date) {
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  return days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`;
}

export default async function ClubAdminOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const overview = await getClubAdminOverview(user, slug);
  const nextEvent = overview.metrics.nextEvent;

  return (
    <div className="club-admin-content">
      <header className="club-admin-header">
        <div>
          <div className="club-admin-chips">
            {overview.status === 'ACTIVE' ? (
              <span className="club-admin-chip gold">✓ Verified</span>
            ) : null}
            <span className="club-admin-chip">{overview.status}</span>
          </div>
          <h1 className="club-admin-display">
            {overview.name.split(' ').slice(0, -1).join(' ')}{' '}
            <em>{overview.name.split(' ').at(-1)}</em>
          </h1>
          <p className="club-admin-muted">{overview.category}</p>
        </div>
        <div className="club-admin-header-actions">
          <Link className="club-admin-outline-button" href={`/clubs/${overview.slug}`}>
            View public page
          </Link>
          <Link className="club-admin-gold-button" href={`/club-admin/${overview.slug}/publishing`}>
            + Publish
          </Link>
        </div>
      </header>

      <section aria-labelledby="today-heading">
        <p className="club-admin-eyebrow" id="today-heading">
          Today for your club
        </p>
        <div className="club-admin-today-grid">
          <article
            className={`club-admin-today-card${overview.metrics.pendingRequests ? ' alert' : ''}`}
          >
            <p className="club-admin-eyebrow">Action needed</p>
            <h2>{overview.metrics.pendingRequests} join requests waiting</h2>
            <p>Review applications from students who want to join your club.</p>
            <Link className="club-admin-navy-button" href={`/club-admin/${overview.slug}/requests`}>
              Review requests
            </Link>
          </article>
          <article className="club-admin-today-card">
            <p className="club-admin-eyebrow">Coming up</p>
            <h2>{nextEvent?.title ?? 'No upcoming event'}</h2>
            <p>
              {nextEvent
                ? `${nextEvent._count.registrations} registered${nextEvent.capacity ? `, ${Math.max(0, nextEvent.capacity - nextEvent._count.registrations)} spots left` : ''}`
                : 'Create an event to bring members together.'}
            </p>
            <Link className="club-admin-navy-button" href={`/club-admin/${overview.slug}/events`}>
              {nextEvent ? 'Open events' : 'Create event'}
            </Link>
          </article>
          <article className="club-admin-today-card">
            <p className="club-admin-eyebrow">Club health</p>
            <h2>{overview.metrics.health}</h2>
            <p>{overview.metrics.healthScore} out of 100 based on available club activity.</p>
            <Link
              className="club-admin-navy-button"
              href={`/club-admin/${overview.slug}/analytics`}
            >
              View analytics
            </Link>
          </article>
        </div>
      </section>

      <section aria-label="Club metrics" className="club-admin-kpi-grid">
        <article className="club-admin-kpi">
          <span>Members</span>
          <strong>{overview.metrics.memberCount}</strong>
          <small>{overview.metrics.membersThisMonth} joined this month</small>
        </article>
        <article className="club-admin-kpi">
          <span>Next event registrations</span>
          <strong>{nextEvent?._count.registrations ?? 0}</strong>
          <small>
            {nextEvent?.capacity
              ? `${Math.max(0, nextEvent.capacity - nextEvent._count.registrations)} spots left`
              : 'No capacity set'}
          </small>
        </article>
        <article className="club-admin-kpi">
          <span>Upcoming events</span>
          <strong>{overview.metrics.upcomingEventCount}</strong>
          <small>Published events ahead</small>
        </article>
        <article className="club-admin-kpi">
          <span>Club health</span>
          <strong>{overview.metrics.healthScore}</strong>
          <small>{overview.metrics.health}</small>
          <div className="club-admin-meter">
            <span style={{ width: `${overview.metrics.healthScore}%` }} />
          </div>
        </article>
      </section>

      <div className="club-admin-feature-grid">
        <section className="club-admin-panel">
          <p className="club-admin-eyebrow">Engagement</p>
          <h2>Attendance by event</h2>
          <div className="club-admin-empty-chart">
            Attendance data will appear after your first check-in.
          </div>
        </section>
        <section className="club-admin-panel">
          <p className="club-admin-eyebrow">Improve your club health</p>
          <h2>Next best steps</h2>
          {overview.metrics.pendingRequests > 0 ? (
            <p className="club-admin-step">
              ○ Approve the {overview.metrics.pendingRequests} pending requests
            </p>
          ) : null}
          {overview.announcements.length === 0 ? (
            <p className="club-admin-step">○ Post an announcement this week</p>
          ) : null}
          {!nextEvent ? <p className="club-admin-step">○ Add an upcoming event</p> : null}
          {!overview.metrics.pendingRequests && overview.announcements.length > 0 && nextEvent ? (
            <p className="club-admin-step">✓ Your club is up to date</p>
          ) : null}
        </section>
      </div>

      <div className="club-admin-lower-grid">
        <section className="club-admin-panel">
          <p className="club-admin-eyebrow">Upcoming</p>
          <h2>Events</h2>
          {overview.events.length === 0 ? (
            <p className="club-admin-muted">No events yet.</p>
          ) : (
            overview.events.slice(0, 3).map((event) => (
              <p className="club-admin-list-row" key={event.id}>
                <strong>{event.title}</strong>
                <span>
                  {formatDate(event.startsAt)} · {event.status.toLowerCase()}
                </span>
              </p>
            ))
          )}
        </section>
        <section className="club-admin-panel">
          <p className="club-admin-eyebrow">Public ledger</p>
          <h2>Latest activity</h2>
          {overview.auditLogs.length === 0 ? (
            <p className="club-admin-muted">Activity will appear here as your team works.</p>
          ) : (
            overview.auditLogs.map((entry) => (
              <p className="club-admin-list-row" key={entry.id}>
                <strong>{entry.action.replaceAll('_', ' ')}</strong>
                <span>
                  by {entry.actor?.fullName ?? 'club admin'} · {formatRelative(entry.createdAt)}
                </span>
              </p>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
