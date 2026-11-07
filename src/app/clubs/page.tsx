import Link from 'next/link';
import { z } from 'zod';

import { listPublicClubs } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

const searchParamsSchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(100).optional(),
});

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = searchParamsSchema.parse(await searchParams);
  const clubs = await listPublicClubs(params);
  return (
    <main className="site-container" style={{ paddingBlock: '4rem' }}>
      <p className="eyebrow">Campus directory</p>
      <h1>Find your community</h1>
      <form action="/clubs" method="get" style={{ marginBlock: '2rem' }}>
        <label htmlFor="club-search">Search clubs</label>
        <input
          id="club-search"
          name="q"
          placeholder="Search by name or interest"
          type="search"
          defaultValue={params.q}
        />
        <button className="button button-primary" type="submit">
          Search
        </button>
      </form>
      <div className="category-grid">
        {clubs.map((club) => (
          <Link className="category-card category-mint" href={`/clubs/${club.slug}`} key={club.id}>
            <span>
              <strong>{club.name}</strong>
              <small>
                {club.category} · {club._count.memberships} members
              </small>
            </span>
            <span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
      {clubs.length === 0 ? <p>No active clubs match that search.</p> : null}
    </main>
  );
}
