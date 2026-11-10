import { cookies } from 'next/headers';
import Link from 'next/link';

import { ClubDiscoveryCard } from '@/components/landing/club-discovery-card';
import { InterestPicker } from '@/components/landing/interest-picker';
import { SiteHeader } from '@/components/shared/site-header';
import { getCurrentSession } from '@/lib/auth/session';
import {
  type DiscoveryQuery,
  discoveryQuerySchema,
  getUserInterestSlugs,
  INTEREST_COOKIE,
  parseDiscoveryQuery,
} from '@/modules/discovery';
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

function discoveryHref(query: DiscoveryQuery, changes: Partial<DiscoveryQuery> = {}) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.interests.length) params.set('interests', next.interests.join(','));
  if (next.category) params.set('category', next.category);
  if (next.sort !== 'match') params.set('sort', next.sort);
  if (next.verifiedOnly) params.set('verified', '1');
  if (next.q) params.set('q', next.q);
  if (next.page > 1) params.set('page', String(next.page));
  return `/${params.size ? `?${params.toString()}` : ''}#clubs-for-you`;
}

function LandingContent({
  data,
  query,
  signedIn,
  invalidFilters = false,
}: {
  data: LandingData;
  query: DiscoveryQuery;
  signedIn: boolean;
  invalidFilters?: boolean;
}) {
  const discovery = data.discovery;
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
            <form className="landing-search" action="/" method="get">
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
                <input
                  defaultValue={query.q}
                  id="landing-search"
                  name="q"
                  placeholder="Search clubs"
                  type="search"
                />
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
        {invalidFilters ? (
          <div className="site-container discovery-query-notice" role="status">
            Some filters in that link were invalid, so the club list has been reset.
          </div>
        ) : null}
        <InterestPicker
          interests={discovery.interests}
          query={query}
          selected={discovery.selectedInterests}
          signedIn={signedIn}
        />
        {discovery.usingFallbackData ? (
          <div className="site-container discovery-query-notice" role="status">
            We’re showing active clubs while personalized recommendations reconnect. Interest
            matching may be temporarily unavailable.
          </div>
        ) : null}

        <section className="landing-section discovery-section" id="clubs-for-you">
          <div className="site-container">
            <div className="landing-section-heading">
              <div>
                <p className="landing-eyebrow">Matched to your interests</p>
                <h2>
                  Clubs for <em>you.</em>
                </h2>
                <p className="discovery-intro">
                  {discovery.usingFallbackData
                    ? 'Browse active campus communities while personalised matching is temporarily unavailable.'
                    : query.interests.length
                      ? 'Recommendations are ranked using your selected interests and recent public club activity.'
                      : 'Explore reviewed clubs and active campus communities.'}
                </p>
              </div>
              <Link
                className="landing-text-link"
                href={discoveryHref(query, { page: 1, category: undefined })}
              >
                View all clubs →
              </Link>
            </div>
            <form action="/" className="discovery-controls" method="get">
              <input name="interests" type="hidden" value={query.interests.join(',')} />
              <input name="q" type="hidden" value={query.q ?? ''} />
              <input name="page" type="hidden" value="1" />
              <label>
                Sort by
                <select
                  defaultValue={
                    !query.interests.length && query.sort === 'match' ? 'active' : query.sort
                  }
                  name="sort"
                >
                  <option value="match">Best match</option>
                  <option value="active">Most active</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
              <label className="discovery-verified-toggle">
                <input
                  defaultChecked={query.verifiedOnly}
                  name="verified"
                  type="checkbox"
                  value="1"
                />
                Verified only
              </label>
              <label>
                Category
                <select defaultValue={query.category ?? ''} name="category">
                  <option value="">All categories</option>
                  {discovery.categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="discovery-control-submit" type="submit">
                Update results
              </button>
            </form>
            {discovery.categories.length > 0 ? (
              <nav
                aria-label="Filter clubs by category"
                className="landing-chips discovery-category-chips"
              >
                <Link
                  aria-current={!query.category ? 'page' : undefined}
                  className={!query.category ? 'active' : ''}
                  href={discoveryHref(query, { category: undefined, page: 1 })}
                >
                  All
                </Link>
                {discovery.categories.map((category) => (
                  <Link
                    aria-current={query.category === category.name ? 'page' : undefined}
                    className={query.category === category.name ? 'active' : ''}
                    href={discoveryHref(query, { category: category.name, page: 1 })}
                    key={category.name}
                  >
                    {category.name}
                    <span>{category.count}</span>
                  </Link>
                ))}
              </nav>
            ) : null}
            {discovery.featured.length ? (
              <div aria-label="Featured clubs" className="discovery-featured-grid">
                {discovery.featured.map((club) => (
                  <ClubDiscoveryCard club={club} key={club.id} />
                ))}
              </div>
            ) : null}
            {discovery.clubs.length ? (
              <div className="discovery-compact-grid">
                {discovery.clubs.map((club) => (
                  <ClubDiscoveryCard club={club} key={club.id} variant="compact" />
                ))}
              </div>
            ) : null}
            {!discovery.total ? (
              <div className="discovery-empty-state">
                <h3>
                  {query.interests.length
                    ? 'No clubs match these interests yet.'
                    : query.q || query.category
                      ? 'No clubs match these filters.'
                      : 'No active clubs are available yet.'}
                </h3>
                <p>
                  {query.interests.length
                    ? 'Try fewer interests or clear your selection to explore every active club.'
                    : 'Club profiles will appear here once they are reviewed and active.'}
                </p>
                {query.interests.length ? (
                  <Link
                    href={discoveryHref({ ...query, interests: [], category: undefined, page: 1 })}
                  >
                    Clear interests
                  </Link>
                ) : (
                  <Link href="/clubs/propose">Propose a club</Link>
                )}
              </div>
            ) : null}
            {discovery.total > query.page * discovery.pageSize ? (
              <div className="discovery-more">
                <Link href={discoveryHref(query, { page: query.page + 1 })}>Show more clubs</Link>
              </div>
            ) : null}
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [rawQuery, session, cookieStore] = await Promise.all([
    searchParams,
    getCurrentSession(),
    cookies(),
  ]);
  const first = (key: string) => (Array.isArray(rawQuery[key]) ? rawQuery[key][0] : rawQuery[key]);
  const queryResult = discoveryQuerySchema.safeParse({
    interests: first('interests'),
    category: first('category'),
    sort: first('sort'),
    verified: first('verified'),
    q: first('q'),
    page: first('page'),
  });
  let query = queryResult.success ? queryResult.data : parseDiscoveryQuery({});
  if (rawQuery.interests === undefined) {
    const saved = session?.user?.id
      ? await getUserInterestSlugs(session.user.id)
      : (cookieStore.get(INTEREST_COOKIE)?.value ?? '').split(',').filter(Boolean);
    if (saved.length)
      query = {
        ...query,
        interests: parseDiscoveryQuery({ interests: saved.join(',') }).interests,
      };
  }
  const data = await getLandingData(query);
  return (
    <>
      <SiteHeader />
      <LandingContent
        data={data}
        invalidFilters={!queryResult.success}
        query={query}
        signedIn={Boolean(session?.user?.id)}
      />
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
