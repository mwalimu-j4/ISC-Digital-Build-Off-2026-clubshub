import Link from 'next/link';

import { SiteHeader } from '@/components/shared/site-header';
import { getLandingData, type LandingData } from '@/modules/landing';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
const timeFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });

function StatTile({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <div className="landing-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return <p className="landing-empty">{children}</p>;
}

function LandingContent({ data }: { data: LandingData }) {
  return (
    <>
      <section className="landing-hero">
        <div className="site-container landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Campus life, in one place</p>
            <h1>
              Find your people.
              <br />
              <em>Find your place.</em>
            </h1>
            <p className="landing-lede">
              Explore the clubs, events, announcements, and community resources that make campus
              feel like home. No account needed to look around.
            </p>
            <form className="landing-search" action="/clubs" method="get">
              <div className="landing-search-tabs" aria-label="Search destinations">
                <Link className="landing-search-tab-active" href="/clubs">
                  Clubs
                </Link>
                <Link href="/lost-found">Lost &amp; Found</Link>
              </div>
              <div>
                <label className="sr-only" htmlFor="landing-search">
                  Search campus life
                </label>
                <input id="landing-search" name="q" placeholder="Search clubs" type="search" />
                <button className="landing-button landing-button-gold" type="submit">
                  Search
                </button>
              </div>
            </form>
          </div>
          <div className="landing-live-card">
            <p className="landing-eyebrow">Live on campus</p>
            <div className="landing-stats">
              <StatTile label="active clubs" value={data.stats.activeClubs} />
              <StatTile label="events this week" value={data.stats.upcomingEvents} />
              <StatTile label="new announcements" value={data.stats.newAnnouncements} />
              <StatTile label="open lost items" value={data.stats.openLostItems} />
            </div>
            {data.events[0] ? (
              <p className="landing-next-up">
                Next up: <strong>{data.events[0].title}</strong> ·{' '}
                {dateFormatter.format(data.events[0].startsAt)}
              </p>
            ) : (
              <p className="landing-next-up">
                Campus activity will appear here when it is available.
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="landing-main">
        <section className="landing-section" id="clubs">
          <div className="site-container">
            <div className="landing-section-heading">
              <div>
                <p className="landing-eyebrow">Find your community</p>
                <h2>Clubs to explore.</h2>
              </div>
              <Link className="landing-text-link" href="/clubs">
                View all clubs →
              </Link>
            </div>
            {data.categories.length > 0 ? (
              <div className="landing-chips">
                {data.categories.map((category) => (
                  <Link
                    href={`/clubs?category=${encodeURIComponent(category.name)}`}
                    key={category.name}
                  >
                    {category.name} <span>{category.count}</span>
                  </Link>
                ))}
              </div>
            ) : null}
            {data.clubs.length > 0 ? (
              <div className="landing-club-grid">
                {data.clubs.map((club) => (
                  <Link className="landing-club-card" href={`/clubs/${club.slug}`} key={club.id}>
                    <span className="landing-club-mark">
                      {club.logoUrl ? '✦' : club.name.charAt(0)}
                    </span>
                    <span>
                      <strong>{club.name}</strong>
                      <small>
                        {club.category} · {club.memberCount} members
                      </small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState>No active clubs are available yet.</EmptyState>
            )}
          </div>
        </section>

        <section className="landing-section landing-section-muted" id="events">
          <div className="site-container">
            <div className="landing-section-heading">
              <div>
                <p className="landing-eyebrow">Make plans</p>
                <h2>Happening soon.</h2>
              </div>
            </div>
            {data.events.length > 0 ? (
              <div className="landing-event-grid">
                {data.events.map((event) => (
                  <article className="landing-event-card" key={event.id}>
                    <div className="landing-date">
                      <strong>{event.startsAt.getDate()}</strong>
                      <span>{monthFormatter.format(event.startsAt)}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.club.name}</p>
                    <small>
                      {timeFormatter.format(event.startsAt)} · {event.location}
                    </small>
                    <Link href={`/clubs/${event.club.slug}`}>View club →</Link>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState>No public upcoming events are available yet.</EmptyState>
            )}
            {data.events.length > 0 ? (
              <p className="landing-note">Registration requires a login.</p>
            ) : null}
          </div>
        </section>

        {data.announcements.length > 0 ? (
          <section className="landing-section" id="announcements">
            <div className="site-container">
              <div className="landing-section-heading">
                <div>
                  <p className="landing-eyebrow">Stay in the know</p>
                  <h2>Campus announcements.</h2>
                </div>
              </div>
              <div className="landing-announcement-grid">
                {data.announcements.map((announcement) => (
                  <article className="landing-announcement" key={announcement.id}>
                    <small>{dateFormatter.format(announcement.createdAt)}</small>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="landing-section landing-lost" id="lost-found">
          <div className="site-container">
            <div className="landing-section-heading">
              <div>
                <p className="landing-eyebrow">Look out for each other</p>
                <h2>Lost &amp; Found.</h2>
              </div>
              <Link className="landing-text-link" href="/lost-found">
                Browse items →
              </Link>
            </div>
            {data.lostItems.length > 0 ? (
              <div className="landing-lost-grid">
                {data.lostItems.map((item) => (
                  <Link className="landing-lost-card" href="/lost-found" key={item.id}>
                    <span>{item.reportType === 'FOUND' ? 'Found item' : 'Lost item'}</span>
                    <strong>{item.category.replaceAll('_', ' ')}</strong>
                    <small>
                      {item.campusArea} · {dateFormatter.format(item.dateOccurred)}
                    </small>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState>No public lost-and-found items are available yet.</EmptyState>
            )}
            <p className="landing-note">Log in to claim an item.</p>
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="site-container">
            <p className="landing-eyebrow">How it works</p>
            <h2>Find your next campus chapter.</h2>
            <div className="landing-how-grid">
              <article>
                <span>01</span>
                <h3>Students</h3>
                <p>
                  Discover communities, follow what is happening, and join the moments that matter
                  to you.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Club leaders</h3>
                <p>Build an active community and share the events and updates your members need.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Administrators</h3>
                <p>Support a connected campus with clear, trusted information for everyone.</p>
              </article>
            </div>
            <Link className="landing-banner" href="/clubs/propose">
              Have an idea for a club? <strong>Propose a club →</strong>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default async function HomePage() {
  const data = await getLandingData();
  return (
    <>
      <SiteHeader />
      <LandingContent data={data} />
      <footer className="site-footer">
        <div className="site-container footer-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              C
            </span>
            <span>ClubsHub</span>
          </Link>
          <p>Made for campus life.</p>
          <div className="footer-links">
            <Link href="/clubs">Explore clubs</Link>
            <Link href="/lost-found">Lost &amp; Found</Link>
            <Link href="/sign-in">Log in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
