import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { ClubServiceError, discoverClubs, joinClub } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

async function joinClubAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  try {
    await joinClub(user, String(formData.get('clubId')));
    revalidatePath('/student/clubs');
    revalidatePath('/student');
  } catch (error) {
    if (error instanceof ClubServiceError) throw new Error(error.message);
    throw error;
  }
}

export default async function StudentClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const user = await requireRole('STUDENT');
  const params = await searchParams;
  const clubs = await discoverClubs(user, {
    search: params.q,
    category: params.category,
    page: Number(params.page ?? 1),
  });
  const categories = [...new Set(clubs.map((club) => club.category))];

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Find your community</p>
        <h1 className="mt-2 text-3xl font-semibold">Discover clubs</h1>
        <p className="mt-2 text-muted-foreground">
          Explore active student communities and find your next place to belong.
        </p>
      </section>
      <form
        className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto]"
        method="get"
      >
        <label className="sr-only" htmlFor="club-search">
          Search clubs
        </label>
        <input
          id="club-search"
          name="q"
          defaultValue={params.q}
          placeholder="Search clubs"
          className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          name="category"
          defaultValue={params.category ?? ''}
          className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Button type="submit">Search</Button>
      </form>
      {clubs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <h2 className="font-semibold">No clubs found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search or propose a new club.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clubs.map((club) => (
            <article
              key={club.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {club.category}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{club.name}</h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {club.description}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {club._count.memberships} members
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/student/clubs/${club.slug}`}>View club</Link>
                </Button>
                {club.membershipStatus === 'APPROVED' ? (
                  <span className="text-xs text-muted-foreground">Member</span>
                ) : club.membershipStatus === 'PENDING' ? (
                  <span className="text-xs text-muted-foreground">Pending</span>
                ) : (
                  <form action={joinClubAction}>
                    <input type="hidden" name="clubId" value={club.id} />
                    <Button size="sm" type="submit">
                      Join
                    </Button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
