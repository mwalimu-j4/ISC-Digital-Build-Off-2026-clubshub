import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import { requireRole } from '@/lib/auth/authorization';
import { getCurrentSession } from '@/lib/auth/session';
import { getApprovedClub, getMembershipStatus, joinClub } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

const membershipInput = z.object({
  clubId: z.string().uuid(),
  slug: z.string().min(1),
});

async function requestMembership(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  const input = membershipInput.parse({
    clubId: formData.get('clubId'),
    slug: formData.get('slug'),
  });
  await joinClub(user, input.clubId);
  revalidatePath(`/clubs/${input.slug}`);
  revalidatePath('/clubs');
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatEventDate(date: Date) {
  return {
    day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date).toUpperCase(),
    time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date),
  };
}

export default async function ClubProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const club = await getApprovedClub(slug);
  if (!club) notFound();

  const session = await getCurrentSession();
  const membership =
    session?.user?.role === 'STUDENT' ? await getMembershipStatus(session.user, club.id) : null;
  const nextEvent = club.events[0];
  const eventDate = nextEvent ? formatEventDate(nextEvent.startsAt) : null;
  const loginUrl = `/sign-in?callbackUrl=${encodeURIComponent(`/clubs/${club.slug}`)}`;

  return (
    <main className="club-page">
      <header className="club-hero">
        <div className="club-hero-inner site-container">
          <div className="club-hero-topline">
            <Link href="/clubs" className="club-back-link">
              ← All clubs
            </Link>
            <div className="club-auth-links">
              {session ? (
                <Link href="/student">Dashboard</Link>
              ) : (
                <>
                  <Link href={loginUrl}>Log in</Link>
                  <Link href={loginUrl} className="club-signup">
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="club-hero-content">
            <div className="club-logo">
              {club.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={club.logoUrl} alt="" />
              ) : (
                initials(club.name)
              )}
            </div>
            <div className="club-hero-copy">
              <div className="club-chips">
                <span className="club-chip club-chip-gold">✓ Verified by UEAB</span>
                <span className="club-chip">{club.category}</span>
                <span className="club-chip">{club._count.memberships} members</span>
              </div>
              <h1>{club.name}</h1>
              <p>{club.description}</p>
            </div>
            <div className="club-hero-actions">
              {membership === 'APPROVED' ? (
                <span className="club-action club-action-member">Member</span>
              ) : membership === 'PENDING' ? (
                <span className="club-action club-action-member">Request pending</span>
              ) : session?.user?.role === 'STUDENT' ? (
                <form action={requestMembership}>
                  <input type="hidden" name="clubId" value={club.id} />
                  <input type="hidden" name="slug" value={club.slug} />
                  <button className="club-action club-action-primary" type="submit">
                    Join club
                  </button>
                </form>
              ) : (
                <Link className="club-action club-action-primary" href={loginUrl}>
                  Join club
                </Link>
              )}
              <button className="club-action club-action-outline" type="button">
                Follow
              </button>
            </div>
          </div>
          <nav className="club-tabs" aria-label="Club sections">
            {[
              'Overview',
              'Events',
              'Showcase',
              'Announcements',
              'Members',
              'Resources',
              'Transparency',
            ].map((tab, index) => (
              <a className={index === 0 ? 'active' : ''} href={`#${tab.toLowerCase()}`} key={tab}>
                {tab}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="club-content site-container">
        <div className="club-main-column">
          <section className="club-section-card" id="overview">
            <p className="club-eyebrow">About</p>
            <h2>What we do</h2>
            <p>{club.purpose}</p>
            <div className="club-activity-list">
              {club.activities.map((activity) => (
                <span key={activity}>{activity}</span>
              ))}
            </div>
          </section>

          {nextEvent && eventDate ? (
            <section className="club-event-highlight" id="events">
              <div className="club-event-date">
                <strong>{eventDate.day}</strong>
                <span>{eventDate.month}</span>
              </div>
              <div>
                <p className="club-eyebrow">Next event · {nextEvent._count.registrations} going</p>
                <h2>{nextEvent.title}</h2>
                <p>
                  {eventDate.time} · {nextEvent.location}
                </p>
              </div>
              <Link className="club-event-button" href={`/student/events/${nextEvent.id}`}>
                View event
              </Link>
            </section>
          ) : (
            <section className="club-empty-card" id="events">
              <p className="club-eyebrow">Next event</p>
              <h2>Events are coming soon</h2>
              <p>This club has not published an upcoming event yet.</p>
            </section>
          )}

          <section className="club-section-card" id="announcements">
            <div className="club-section-heading">
              <div>
                <p className="club-eyebrow">Announcements</p>
                <h2>Latest from the club</h2>
              </div>
            </div>
            {club.announcements.length > 0 ? (
              <div className="club-announcement-list">
                {club.announcements.map((announcement) => (
                  <article key={announcement.id}>
                    <span>{announcement.pinned ? 'Pinned' : 'Update'}</span>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="club-muted">No public announcements have been published yet.</p>
            )}
          </section>
        </div>

        <aside className="club-side-column">
          <section className="club-section-card club-integrity" id="transparency">
            <p className="club-eyebrow">Integrity panel</p>
            <h2>Verified and transparent</h2>
            <ul>
              <li>✓ Approved by UEAB administration</li>
              <li>✓ Leadership list confirmed</li>
              <li>✓ Public activity ledger</li>
            </ul>
            <div className="club-health">
              <div>
                <span>Club health</span>
                <strong>Active</strong>
              </div>
              <span className="club-health-track">
                <span />
              </span>
              <small>Based on published club activity.</small>
            </div>
          </section>

          <section className="club-section-card" id="members">
            <p className="club-eyebrow">Leadership</p>
            <h2>Club team</h2>
            {club.memberships.length > 0 ? (
              <div className="club-leadership">
                {club.memberships.map((leader) => (
                  <div key={leader.user.fullName}>
                    <span>{initials(leader.user.fullName)}</span>
                    <div>
                      <strong>{leader.user.fullName}</strong>
                      <small>Club administrator</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="club-muted">Leadership information will appear here soon.</p>
            )}
          </section>

          <section className="club-join-card">
            <p className="club-eyebrow">Your member card</p>
            <h2>Join the community</h2>
            <p>Become a member to access club resources, events, and updates.</p>
            <Link className="club-action club-action-light" href={loginUrl}>
              Get started →
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
