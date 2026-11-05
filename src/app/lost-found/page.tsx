import { LostFoundPage } from '@/components/lost-found/lost-found-page';
import { SiteHeader } from '@/components/shared/site-header';

export const dynamic = 'force-dynamic';

export default function LostFoundMainPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <LostFoundPage />
      </main>
    </>
  );
}
