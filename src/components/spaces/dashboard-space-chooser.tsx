import Link from 'next/link';

import { ChooserSpaces } from '@/components/spaces/chooser-spaces';
import { SpaceAccountActions } from '@/components/spaces/space-account-actions';
import type { UserSpace } from '@/modules/spaces';

type DashboardSpaceChooserProps = {
  spaces: UserSpace[];
  backHref: string;
  dashboardLabel: string;
};

export function DashboardSpaceChooser({
  spaces,
  backHref,
  dashboardLabel,
}: DashboardSpaceChooserProps) {
  const clubCount = spaces.filter((space) => space.club).length;

  return (
    <section className="dashboard-space-chooser" aria-labelledby="dashboard-space-heading">
      <Link className="dashboard-space-back" href={backHref}>
        <span aria-hidden="true">←</span> Back to {dashboardLabel}
      </Link>
      <div className="dashboard-space-heading">
        <p className="club-admin-eyebrow">Workspace switcher</p>
        <h1 id="dashboard-space-heading">
          Where to <em>next?</em>
        </h1>
        <p>
          Move between your {clubCount} club connection{clubCount === 1 ? '' : 's'} without signing
          out.
        </p>
      </div>
      <ChooserSpaces spaces={spaces} />
      <div className="dashboard-space-footer">
        <span>Need a different account?</span>
        <SpaceAccountActions />
      </div>
    </section>
  );
}
