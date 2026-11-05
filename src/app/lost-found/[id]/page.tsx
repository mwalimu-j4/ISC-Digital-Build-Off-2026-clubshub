import { ItemDetail } from '@/components/lost-found/item-detail';
import { SiteHeader } from '@/components/shared/site-header';
import { requireUser } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  return (
    <>
      <SiteHeader />
      <main>
        <ItemDetail itemId={id} userId={user.id} userRole={user.role} />
      </main>
    </>
  );
}
