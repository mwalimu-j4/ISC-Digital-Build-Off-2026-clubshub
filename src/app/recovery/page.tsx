import { RecoveryDashboard } from '@/components/lost-found/recovery-dashboard';
import { SiteHeader } from '@/components/shared/site-header';
import { requireAnyRole } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function RecoveryPage() {
  await requireAnyRole('RECOVERY_OFFICER', 'SUPER_ADMIN');
  return (
    <>
      <SiteHeader />
      <main className="recovery-theme">
        <RecoveryDashboard />
      </main>
    </>
  );
}
