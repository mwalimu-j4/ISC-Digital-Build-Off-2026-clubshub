import Link from 'next/link';

import { listApprovedClubs } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
  const clubs = await listApprovedClubs();
  return (
    <main className="site-container" style={{ paddingBlock: '4rem' }}>
      <p className="eyebrow">Campus directory</p>
      <h1>Find your community</h1>
      <div className="category-grid">
        {clubs.map((club) => (
          <Link className="category-card category-mint" href={`/clubs/${club.slug}`} key={club.id}>
            <span>
              <strong>{club.name}</strong>
              <small>{club.category}</small>
            </span>
            <span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
