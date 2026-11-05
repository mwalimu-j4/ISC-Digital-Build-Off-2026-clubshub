import { NotificationsFullPage } from '@/components/lost-found/notifications-full-page';
import { SiteHeader } from '@/components/shared/site-header';
import { requireUser } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  await requireUser();
  return (
    <>
      <SiteHeader />
      <main><NotificationsFullPage /></main>
    </>
  );
}
