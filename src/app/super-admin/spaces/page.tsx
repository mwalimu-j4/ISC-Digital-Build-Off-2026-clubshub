import { DashboardSpaceChooser } from '@/components/spaces/dashboard-space-chooser';
import { requireRole } from '@/lib/auth/authorization';
import { getUserSpaces } from '@/modules/spaces';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSpacesPage() {
  const user = await requireRole('SUPER_ADMIN');
  const spaces = await getUserSpaces(user);
  return (
    <main className="admin-content">
      <DashboardSpaceChooser
        backHref="/super-admin"
        dashboardLabel="admin dashboard"
        spaces={spaces}
      />
    </main>
  );
}
