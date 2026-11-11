'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState, useTransition } from 'react';

import {
  saveInterestPreferences,
  updateInterestPreferences,
} from '@/app/actions/discovery-actions';
import { ClubCard } from '@/components/clubs/club-card';
import type { DiscoveryQuery, DiscoveryResult } from '@/modules/discovery';

function hrefForQuery(query: DiscoveryQuery) {
  const params = new URLSearchParams();
  if (query.interests.length) params.set('interests', query.interests.join(','));
  if (query.category) params.set('category', query.category);
  if (query.sort !== 'match') params.set('sort', query.sort);
  if (query.verifiedOnly) params.set('verified', '1');
  if (query.q) params.set('q', query.q);
  if (query.page > 1) params.set('page', String(query.page));
  return `/${params.size ? `?${params.toString()}` : ''}#clubs-for-you`;
}

export function ClubDiscoveryExperience({
  discovery,
  query,
  signedIn,
  invalidFilters = false,
}: {
  discovery: DiscoveryResult;
  query: DiscoveryQuery;
  signedIn: boolean;
  invalidFilters?: boolean;
}) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(discovery.selectedInterests);
  const [isPending, startTransition] = useTransition();
  const displaySort = !query.interests.length && query.sort === 'match' ? 'active' : query.sort;
  const selectedInterestSet = new Set(discovery.selectedInterests);
  const selectedInterestRecords = discovery.interests.filter((interest) =>
    selectedInterestSet.has(interest.slug),
  );
  const allClubCards = [...discovery.featured, ...discovery.clubs];
  const totalCategories = discovery.categories.reduce(
    (total, category) => total + category.count,
    0,
  );

  useEffect(() => setHydrated(true), []);
  useEffect(() => setSelectedInterests(discovery.selectedInterests), [discovery.selectedInterests]);

  function navigate(nextQuery: DiscoveryQuery) {
    startTransition(() =>
      router.replace(hrefForQuery({ ...nextQuery, page: 1 }), { scroll: false }),
    );
  }

  function applyPreferenceUpdate(formData: FormData) {
    startTransition(async () => {
      const href = await updateInterestPreferences(formData);
      router.replace(href, { scroll: false });
    });
  }

  function handleInterestChange(form: HTMLFormElement) {
    const formData = new FormData(form);
    setSelectedInterests(formData.getAll('interest').map(String));
    applyPreferenceUpdate(formData);
  }

  function handlePreferenceSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hydrated) return;
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.name) {
      formData.set(submitter.name, submitter.value);
    }
    applyPreferenceUpdate(formData);
  }

  function handleFilterChange(form: HTMLFormElement) {
    const values = new FormData(form);
    navigate({
      ...query,
      interests: query.interests,
      category: String(values.get('category') ?? '') || undefined,
      sort: (String(values.get('sort') ?? displaySort) as DiscoveryQuery['sort']) || displaySort,
      verifiedOnly: values.get('verified') === '1',
      q: String(values.get('q') ?? '') || undefined,
      page: 1,
    });
  }

  function handleCategory(category?: string) {
    navigate({ ...query, category, page: 1 });
  }

  const interestCallback = hrefForQuery(query);

  return (
    <>
      {invalidFilters ? (
        <div className="site-container discovery-query-notice" role="status">
          Some filters in that link were invalid, so the club list has been reset.
        </div>
      ) : null}

      <section
        aria-labelledby="interest-heading"
        className="discovery-interest-section"
        id="interest-picker"
      >
        <div className="site-container">
          <div className="discovery-interest-panel">
            <div className="discovery-interest-heading">
              <div>
                <p className="landing-eyebrow">Personalise your discovery</p>
                <h2 id="interest-heading">
                  What are you <em>interested in?</em>
                </h2>
              </div>
              <p>Pick a few. We’ll surface the clubs that fit. No account needed.</p>
            </div>
            {discovery.interests.length ? (
              <form
                action={saveInterestPreferences}
                className="discovery-interest-form"
                onSubmit={handlePreferenceSubmit}
              >
                <input name="q" type="hidden" value={query.q ?? ''} />
                <input name="category" type="hidden" value={query.category ?? ''} />
                <input name="sort" type="hidden" value={query.sort} />
                <input name="verified" type="hidden" value={query.verifiedOnly ? '1' : '0'} />
                <div className="discovery-interest-options">
                  {discovery.interests.map((interest) => {
                    const checked = selectedInterests.includes(interest.slug);
                    return (
                      <label
                        className={`discovery-interest-chip${checked ? ' selected' : ''}`}
                        key={interest.id}
                      >
                        <input
                          checked={checked}
                          name="interest"
                          onChange={(event) => {
                            const form = event.currentTarget.form;
                            if (form) handleInterestChange(form);
                          }}
                          type="checkbox"
                          value={interest.slug}
                        />
                        <span aria-hidden="true">{checked ? '✓' : ''}</span>
                        {interest.name}
                      </label>
                    );
                  })}
                </div>
                <div className="discovery-interest-footer">
                  <span aria-live="polite">{selectedInterests.length} selected</span>
                  {signedIn ? (
                    <span className="discovery-account-note">
                      Saved to your account when changed.
                    </span>
                  ) : (
                    <Link href={`/sign-in?callbackUrl=${encodeURIComponent(interestCallback)}`}>
                      Log in to save my interests
                    </Link>
                  )}
                  <button className="discovery-clear" name="clear" type="submit" value="1">
                    Clear
                  </button>
                  {!hydrated ? (
                    <button className="landing-button landing-button-gold" type="submit">
                      Show matching clubs
                    </button>
                  ) : null}
                </div>
              </form>
            ) : (
              <p className="landing-empty">Interest choices will appear here when available.</p>
            )}
          </div>
        </div>
      </section>

      <section className="landing-section discovery-section" id="clubs-for-you">
        <div className="site-container">
          <div className="landing-section-heading discovery-heading">
            <div>
              <p className="landing-eyebrow">Matched to your interests</p>
              <h2>
                Clubs for <em>you.</em>
              </h2>
              <p className="discovery-intro">
                {query.interests.length
                  ? 'Recommendations use your interests and recent public club activity.'
                  : 'Explore reviewed clubs and active campus communities.'}
              </p>
            </div>
            <Link
              className="landing-text-link"
              href={hrefForQuery({ ...query, category: undefined, page: 1 })}
            >
              View all clubs →
            </Link>
          </div>

          <div className="discovery-controls-panel">
            <div className="discovery-control-top-row">
              <div aria-label="Selected interests" className="discovery-selected-interests">
                <span className="discovery-control-label">Your interests</span>
                {selectedInterestRecords.length ? (
                  <div className="discovery-selected-chips">
                    {selectedInterestRecords.map((interest) => (
                      <form
                        action={saveInterestPreferences}
                        className="discovery-selected-interest-form"
                        key={interest.slug}
                        onSubmit={handlePreferenceSubmit}
                      >
                        {query.interests
                          .filter((slug) => slug !== interest.slug)
                          .map((slug) => (
                            <input key={slug} name="interest" type="hidden" value={slug} />
                          ))}
                        <input name="q" type="hidden" value={query.q ?? ''} />
                        <input name="category" type="hidden" value={query.category ?? ''} />
                        <input name="sort" type="hidden" value={query.sort} />
                        <input
                          name="verified"
                          type="hidden"
                          value={query.verifiedOnly ? '1' : '0'}
                        />
                        <button
                          aria-label={`Remove ${interest.name} interest`}
                          className="discovery-selected-chip"
                          type="submit"
                        >
                          {interest.name} <span aria-hidden="true">×</span>
                        </button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <span className="discovery-no-interests">No interests selected</span>
                )}
                <a className="discovery-edit-interests" href="#interest-heading">
                  Edit interests
                </a>
              </div>

              <form
                action="/"
                className="discovery-filter-form"
                method="get"
                onChange={(event) => {
                  if (hydrated) handleFilterChange(event.currentTarget);
                }}
              >
                <input name="interests" type="hidden" value={query.interests.join(',')} />
                <input name="q" type="hidden" value={query.q ?? ''} />
                <input name="page" type="hidden" value="1" />
                <label className="discovery-filter-control">
                  <span>Sort by</span>
                  <select defaultValue={displaySort} name="sort">
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
                  <span>Verified only</span>
                </label>
                <label
                  className="discovery-filter-control discovery-no-js-category"
                  hidden={hydrated}
                >
                  <span>Category</span>
                  <select defaultValue={query.category ?? ''} name="category">
                    <option value="">All categories</option>
                    {discovery.categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                {!hydrated ? (
                  <button className="discovery-control-submit" type="submit">
                    Apply filters
                  </button>
                ) : null}
              </form>
            </div>

            {discovery.categories.length ? (
              <nav
                aria-label="Filter clubs by category"
                className="discovery-category-chips"
                hidden={!hydrated}
              >
                <button
                  aria-pressed={!query.category}
                  className={!query.category ? 'active' : ''}
                  onClick={() => handleCategory(undefined)}
                  type="button"
                >
                  All <span>{totalCategories}</span>
                </button>
                {discovery.categories.map((category) => (
                  <button
                    aria-pressed={query.category === category.name}
                    className={query.category === category.name ? 'active' : ''}
                    key={category.name}
                    onClick={() => handleCategory(category.name)}
                    type="button"
                  >
                    {category.name} <span>{category.count}</span>
                  </button>
                ))}
              </nav>
            ) : null}
          </div>

          {discovery.usingFallbackData ? (
            <div className="discovery-fallback-notice" role="status">
              <Info aria-hidden="true" size={18} />
              <span>Showing the most active clubs while recommendations are unavailable.</span>
            </div>
          ) : null}

          {discovery.total ? (
            <div className="discovery-grid-shell">
              <div
                aria-busy={isPending}
                aria-label="Club recommendations"
                className={`discovery-grid${isPending ? ' is-pending' : ''}`}
              >
                {allClubCards.map((club) => (
                  <ClubCard
                    actions={
                      <>
                        <Link className="discovery-join-button" href={`/clubs/${club.slug}`}>
                          Join club
                        </Link>
                        <Link
                          aria-label={`View ${club.name}`}
                          className="discovery-view-button"
                          href={`/clubs/${club.slug}`}
                        >
                          View
                        </Link>
                      </>
                    }
                    club={club}
                    details={club}
                    key={club.id}
                    rows={[
                      {
                        label: 'Next',
                        value: club.nextEvent
                          ? `${club.nextEvent.title} · ${new Intl.DateTimeFormat('en', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            }).format(club.nextEvent.startsAt)}`
                          : 'No upcoming public event',
                      },
                      {
                        label: 'Led by',
                        value: club.chairperson
                          ? `${club.chairperson.title} · ${club.chairperson.name}`
                          : 'Leadership not listed yet',
                        muted: !club.chairperson,
                      },
                    ]}
                  />
                ))}
              </div>
              {isPending ? (
                <div aria-hidden="true" className="discovery-loading-overlay">
                  {[0, 1, 2].map((index) => (
                    <div className="discovery-card-skeleton" key={index}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
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
                <form action={saveInterestPreferences} onSubmit={handlePreferenceSubmit}>
                  <input name="clear" type="hidden" value="1" />
                  <input name="category" type="hidden" value="" />
                  <input name="sort" type="hidden" value="match" />
                  <input name="verified" type="hidden" value="0" />
                  <input name="q" type="hidden" value={query.q ?? ''} />
                  <button className="discovery-empty-action" type="submit">
                    Clear interests
                  </button>
                </form>
              ) : (
                <Link href="/clubs/propose">Propose a club</Link>
              )}
            </div>
          )}
          {discovery.total > query.page * discovery.pageSize ? (
            <div className="discovery-more">
              <Link href={hrefForQuery({ ...query, page: query.page + 1 })}>Show more clubs</Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
