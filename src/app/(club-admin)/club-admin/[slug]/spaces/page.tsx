import { notFound } from 'next/navigation';

import { DashboardSpaceChooser } from '@/components/spaces/dashboard-space-chooser';
import { requireUser } from '@/lib/auth/authorization';
import { ClubAdminAuthorizationError, getClubAdminOverview } from '@/modules/club-admin-overview';
import { getUserSpaces } from '@/modules/spaces';

export const dynamic = 'force-dynamic';

export default async function ClubAdminSpacesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  try {
    const overview = await getClubAdminOverview(user, slug);
    const spaces = await getUserSpaces(user);
    return (
      <div className="club-admin-content">
        <DashboardSpaceChooser
          backHref={`/club-admin/${overview.slug}`}
          dashboardLabel={`${overview.name} dashboard`}
          spaces={spaces}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ClubAdminAuthorizationError) notFound();
    throw error;
  }
}
