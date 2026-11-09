import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ChooserSpaces } from '@/components/spaces/chooser-spaces';
import { SpaceAccountActions } from '@/components/spaces/space-account-actions';
import { requireUser } from '@/lib/auth/authorization';
import { getUserSpaces } from '@/modules/spaces';

export const dynamic = 'force-dynamic';

export default async function ChoosePage() {
  const user = await requireUser();
  const spaces = await getUserSpaces(user);
  const manage = spaces.filter((space) => space.kind === 'admin');
  const member = spaces.filter((space) => space.kind === 'member');
  const enterable = spaces.filter((space) => space.href);
  if (enterable.length === 1 && enterable[0]?.href) redirect(enterable[0].href);

  return (
    <main className="choose-page">
      <header className="choose-header">
        <Link className="choose-brand" href="/">
          <span> C </span> ClubsHub
        </Link>
        <p>
          Signed in as {user.name ?? 'your account'} ·{' '}
          <Link href="/sign-in">Not you? Switch account</Link>
        </p>
      </header>
      <section className="choose-content">
        <p className="club-admin-eyebrow">Welcome back</p>
        <h1>
          Where to <em>today?</em>
        </h1>
        <p className="choose-lede">
          You have {manage.length + member.length} club connection
          {manage.length + member.length === 1 ? '' : 's'} ready to explore.
        </p>
        <ChooserSpaces spaces={spaces} />
        <div className="choose-signout">
          <SpaceAccountActions />
        </div>
      </section>
    </main>
  );
}
