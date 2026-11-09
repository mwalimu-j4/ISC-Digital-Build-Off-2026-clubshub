import { DashboardSpaceChooser } from '@/components/spaces/dashboard-space-chooser';
import { requireRole } from '@/lib/auth/authorization';
import { getUserSpaces } from '@/modules/spaces';

export const dynamic = 'force-dynamic';

export default async function StudentSpacesPage() {
  const user = await requireRole('STUDENT');
  const spaces = await getUserSpaces(user);
  return (
    <DashboardSpaceChooser backHref="/student" dashboardLabel="student dashboard" spaces={spaces} />
  );
}
