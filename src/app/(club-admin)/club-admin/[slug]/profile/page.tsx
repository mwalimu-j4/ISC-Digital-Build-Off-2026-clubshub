import Link from 'next/link';

import { requireUser } from '@/lib/auth/authorization';
import { getClubInterestSettings } from '@/modules/discovery';

import { saveClubInterestSettings } from '../profile-actions';

export const dynamic = 'force-dynamic';

export default async function ClubProfileSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const { saved } = await searchParams;
  const settings = await getClubInterestSettings(user.id, slug);
  const selected = new Set(settings.interestIds);

  return (
    <div className="club-admin-content">
      <p className="club-admin-eyebrow">Club admin · {settings.name}</p>
      <h1 className="club-admin-display">
        Club <em>profile</em>
      </h1>
      <section className="club-admin-panel club-discovery-settings">
        <p className="club-admin-eyebrow">Public discovery</p>
        <h2>Choose your club interests</h2>
        <p className="club-admin-muted">
          Select one to five interests that describe this club. They help students find your
          community in public discovery results.
        </p>
        {saved === '1' ? (
          <p className="club-discovery-saved" role="status">
            Your public discovery interests have been updated.
          </p>
        ) : null}
        <form action={saveClubInterestSettings} className="club-discovery-interest-form">
          <input name="slug" type="hidden" value={slug} />
          <fieldset>
            <legend>
              Club interests <span>(choose 1–5)</span>
            </legend>
            <div>
              {settings.interests.map((interest) => (
                <label className="club-discovery-interest-option" key={interest.id}>
                  <input
                    defaultChecked={selected.has(interest.id)}
                    name="interestId"
                    type="checkbox"
                    value={interest.id}
                  />
                  <span>{interest.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="club-discovery-settings-actions">
            <button className="club-admin-gold-button" type="submit">
              Save interests
            </button>
            <Link className="club-admin-outline-button" href={`/club-admin/${slug}`}>
              Back to overview
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
