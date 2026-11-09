import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { ClubAdminShell } from '@/components/club-admin/club-admin-shell';
import { requireUser } from '@/lib/auth/authorization';
import { ClubAdminAuthorizationError, getClubAdminOverview } from '@/modules/club-admin-overview';
import { getUserSpaces } from '@/modules/spaces';

export const dynamic = 'force-dynamic';

export default async function ClubAdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  try {
    const overview = await getClubAdminOverview(user, slug);
    const spaces = await getUserSpaces(user);
    return (
      <ClubAdminShell
        club={overview}
        pendingRequests={overview.metrics.pendingRequests}
        spaces={spaces}
        userName={user.name ?? null}
      >
        {children}
      </ClubAdminShell>
    );
  } catch (error) {
    if (error instanceof ClubAdminAuthorizationError) {
      redirect('/unauthorized');
    }
    throw error;
  }
}
