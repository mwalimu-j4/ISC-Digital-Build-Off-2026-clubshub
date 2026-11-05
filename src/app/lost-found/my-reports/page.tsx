import { MyReportsPage } from '@/components/lost-found/my-reports-page';
import { SiteHeader } from '@/components/shared/site-header';
import { requireUser } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function MyReportsRoute() {
  await requireUser();
  return (
    <>
      <SiteHeader />
      <main><MyReportsPage /></main>
    </>
  );
}
