import Link from 'next/link';

import { requireUser } from '@/lib/auth/authorization';
import { getOwnProposals } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

export default async function MyClubsPage() {
  const user = await requireUser();
  const clubs = await getOwnProposals(user);
  return (
    <main className="site-container" style={{ paddingBlock: '4rem' }}>
      <p className="eyebrow">Club management</p>
      <h1>Your proposals</h1>
      <ul>
        {clubs.map((club) => (
          <li key={club.id}>
            <Link href={`/clubs/${club.slug}`}>{club.name}</Link> — {club.status}
            {club.rejectionReason
              ? `: ${club.rejectionReason}`
              : club.changeRequestReason
                ? `: ${club.changeRequestReason}`
                : ''}
          </li>
        ))}
      </ul>
    </main>
  );
}
