import Link from 'next/link';

import { saveInterestPreferences } from '@/app/actions/discovery-actions';
import type { DiscoveryInterest } from '@/modules/discovery';

export function InterestPicker({
  interests,
  selected,
  signedIn,
  query,
}: {
  interests: DiscoveryInterest[];
  selected: string[];
  signedIn: boolean;
  query: { q?: string; category?: string; sort: string; verifiedOnly: boolean };
}) {
  const callback = `/?${selected.length ? `interests=${encodeURIComponent(selected.join(','))}` : ''}#clubs-for-you`;
  return (
    <section aria-labelledby="interest-heading" className="discovery-interest-section">
      <div className="site-container">
        <div className="discovery-interest-panel">
          <div className="discovery-interest-heading">
            <div>
              <p className="landing-eyebrow">Personalise your discovery</p>
              <h2 id="interest-heading">
                What are you <em>interested in?</em>
              </h2>
            </div>
            <p>Pick a few. We’ll surface clubs that match your interests.</p>
          </div>
          {interests.length ? (
            <form action={saveInterestPreferences} className="discovery-interest-form">
              <input name="q" type="hidden" value={query.q ?? ''} />
              <input name="category" type="hidden" value={query.category ?? ''} />
              <input name="sort" type="hidden" value={query.sort} />
              <input name="verified" type="hidden" value={query.verifiedOnly ? '1' : '0'} />
              <div className="discovery-interest-options">
                {interests.map((interest) => {
                  const checked = selected.includes(interest.slug);
                  return (
                    <label
                      className={`discovery-interest-chip${checked ? ' selected' : ''}`}
                      key={interest.id}
                    >
                      <input
                        defaultChecked={checked}
                        name="interest"
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
                <span aria-live="polite">{selected.length} selected</span>
                {signedIn ? (
                  <span className="discovery-account-note">
                    Saved to your account when you apply.
                  </span>
                ) : (
                  <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callback)}`}>
                    Log in to save my interests
                  </Link>
                )}
                <button className="discovery-clear" name="clear" type="submit" value="1">
                  Clear
                </button>
                <button className="landing-button landing-button-gold" type="submit">
                  Show matching clubs
                </button>
              </div>
            </form>
          ) : (
            <p className="landing-empty">Interest choices will appear here when available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
