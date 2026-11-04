import { SiteHeader } from '@/components/shared/site-header';

const clubCategories = [
  { icon: '✦', name: 'Creative arts', count: '18 clubs', color: 'lilac' },
  { icon: '◎', name: 'Technology', count: '24 clubs', color: 'mint' },
  { icon: '⚑', name: 'Sports & wellness', count: '16 clubs', color: 'peach' },
  { icon: '◌', name: 'Community', count: '21 clubs', color: 'sky' },
];

const upcomingEvents = [
  {
    date: '12',
    month: 'OCT',
    title: 'Campus Creatives Showcase',
    club: 'Arts Society',
    time: '5:30 PM · Student Centre',
  },
  {
    date: '15',
    month: 'OCT',
    title: 'Women in Tech: Build Night',
    club: 'Tech Collective',
    time: '6:00 PM · Innovation Lab',
  },
  {
    date: '19',
    month: 'OCT',
    title: 'Saturday Social Run',
    club: 'Wellness Club',
    time: '8:00 AM · North Gate',
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="home">
        <section className="hero-section">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" /> Your campus, connected
              </p>
              <h1>
                Find your people.
                <br />
                <em>Find your place.</em>
              </h1>
              <p className="hero-lede">
                ClubsHub brings every club, event, and campus moment into one welcoming space.
                Discover what moves you and make this year yours.
              </p>
              <div className="hero-actions">
                <a className="button button-primary button-large" href="#discover">
                  Explore clubs <span aria-hidden="true">→</span>
                </a>
                <a className="text-link" href="#how-it-works">
                  See how it works <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span>AM</span>
                  <span>JK</span>
                  <span>SL</span>
                  <span>+</span>
                </div>
                <span>
                  Join a community of <strong>2,400+ students</strong>
                </span>
              </div>
            </div>
            <div className="hero-visual" aria-label="Students connecting at a campus event">
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <div className="hero-card hero-card-main">
                <div className="hero-illustration">
                  <div className="illustration-sun" />
                  <div className="illustration-building building-left" />
                  <div className="illustration-building building-right" />
                  <div className="illustration-tree tree-left" />
                  <div className="illustration-tree tree-right" />
                  <div className="illustration-person person-one" />
                  <div className="illustration-person person-two" />
                  <div className="illustration-person person-three" />
                  <div className="illustration-ground" />
                </div>
                <div className="hero-card-label">
                  <span className="status-dot" /> Campus is buzzing
                </div>
              </div>
              <div className="floating-card floating-event">
                <span className="floating-icon">✦</span>
                <div>
                  <strong>12 events</strong>
                  <small>happening this week</small>
                </div>
              </div>
              <div className="floating-card floating-club">
                <span className="floating-icon">◎</span>
                <div>
                  <strong>New club found</strong>
                  <small>Design &amp; Culture Society</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="value-section" id="how-it-works">
          <div className="site-container">
            <div className="section-heading centered">
              <p className="eyebrow">One place for campus life</p>
              <h2>More ways to feel at home.</h2>
              <p>
                Whether you&apos;re looking to join, lead, or simply find something new, your next
                chapter starts here.
              </p>
            </div>
            <div className="value-grid">
              <article className="value-card value-card-coral">
                <span className="feature-icon">⌕</span>
                <h3>Discover your thing</h3>
                <p>
                  Browse clubs by interest, meet people who get it, and find a community that feels
                  like yours.
                </p>
                <a href="#discover">
                  Explore clubs <span>→</span>
                </a>
              </article>
              <article className="value-card value-card-sage">
                <span className="feature-icon">◷</span>
                <h3>Never miss a moment</h3>
                <p>
                  From big campus gatherings to small club meetups, keep every event on your radar.
                </p>
                <a href="#events">
                  View events <span>→</span>
                </a>
              </article>
              <article className="value-card value-card-lilac">
                <span className="feature-icon">♡</span>
                <h3>Look out for each other</h3>
                <p>
                  A simpler way to report, find, and return lost items across the university
                  community.
                </p>
                <a href="#lost-found">
                  Visit lost &amp; found <span>→</span>
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="discover-section" id="discover">
          <div className="site-container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Find your community</p>
                <h2>There&apos;s a place for you here.</h2>
              </div>
              <a className="text-link" href="#discover">
                View all clubs <span>→</span>
              </a>
            </div>
            <div className="category-grid">
              {clubCategories.map((category) => (
                <a
                  className={`category-card category-${category.color}`}
                  href="#discover"
                  key={category.name}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span>
                    <strong>{category.name}</strong>
                    <small>{category.count}</small>
                  </span>
                  <span className="category-arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="site-container">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Make plans</p>
                <h2>What&apos;s happening soon.</h2>
              </div>
              <a className="text-link" href="#events">
                See all events <span>→</span>
              </a>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <article className="event-row" key={event.title}>
                  <div className="event-date">
                    <strong>{event.date}</strong>
                    <small>{event.month}</small>
                  </div>
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <p>
                      {event.club} <span>·</span> {event.time}
                    </p>
                  </div>
                  <a className="round-arrow" href="#events" aria-label={`View ${event.title}`}>
                    ↗
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lost-section" id="lost-found">
          <div className="site-container lost-grid">
            <div className="lost-copy">
              <p className="eyebrow">Small act, big difference</p>
              <h2>
                Lost something?
                <br />
                <em>Let&apos;s bring it home.</em>
              </h2>
              <p>
                Our campus is better when we look out for one another. Browse found items or let the
                community know what you&apos;re looking for.
              </p>
              <a className="button button-dark" href="#lost-found">
                Visit lost &amp; found <span>→</span>
              </a>
            </div>
            <div className="lost-art" aria-hidden="true">
              <div className="lost-sun" />
              <div className="lost-ground" />
              <div className="lost-person" />
              <div className="lost-object">⌂</div>
              <div className="lost-flower flower-one" />
              <div className="lost-flower flower-two" />
            </div>
          </div>
        </section>

        <section className="closing-section" id="announcements">
          <div className="site-container closing-inner">
            <p className="eyebrow">Your campus starts here</p>
            <h2>
              There&apos;s more to university
              <br />
              when you find your people.
            </h2>
            <a className="button button-primary button-large" href="#discover">
              Get started <span>→</span>
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-container footer-inner">
          <a className="brand" href="#home">
            <span className="brand-mark" aria-hidden="true">
              C
            </span>
            <span>ClubsHub</span>
          </a>
          <p>Made for campus life.</p>
          <div className="footer-links">
            <a href="#discover">Explore clubs</a>
            <a href="#events">Upcoming events</a>
          </div>
        </div>
      </footer>
    </>
  );
}
