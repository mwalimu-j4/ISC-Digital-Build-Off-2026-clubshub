import { RecoveryTaskDetail } from '@/components/lost-found/recovery-task-detail';
import { SiteHeader } from '@/components/shared/site-header';
import { requireAnyRole } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function RecoveryTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAnyRole('RECOVERY_OFFICER', 'SUPER_ADMIN');
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <main><RecoveryTaskDetail taskId={id} /></main>
    </>
  );
}
