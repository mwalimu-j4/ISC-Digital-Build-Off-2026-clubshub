import type { ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { requireRole } from '@/lib/auth/authorization';
import { getAdminOverview } from '@/modules/admin-overview';
import { getUserSpaces } from '@/modules/spaces';

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole('SUPER_ADMIN');
  const overview = await getAdminOverview(user);
  const spaces = await getUserSpaces(user);
  return (
    <AdminShell pendingCount={overview.pendingApprovals} userName={user.name} spaces={spaces}>
      {children}
    </AdminShell>
  );
}
