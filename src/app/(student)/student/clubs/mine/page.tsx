import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { getOwnMemberships, leaveClub } from '@/modules/clubs/service';

async function leaveClubAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  await leaveClub(user, String(formData.get('clubId')));
  revalidatePath('/student/clubs/mine');
  revalidatePath('/student');
}

export default async function MyStudentClubsPage() {
  const user = await requireRole('STUDENT');
  const memberships = await getOwnMemberships(user);
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Your communities</p>
        <h1 className="mt-2 text-3xl font-semibold">My clubs</h1>
      </section>
      {memberships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">You have no club memberships yet.</p>
          <Button asChild className="mt-4">
            <Link href="/student/clubs">Discover clubs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div>
                <Link
                  href={`/clubs/${membership.club.slug}`}
                  className="font-semibold hover:text-primary"
                >
                  {membership.club.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {membership.club.category} · {membership.role.replace('_', ' ')} ·{' '}
                  {membership.status}
                </p>
              </div>
              {membership.status === 'APPROVED' && (
                <form action={leaveClubAction}>
                  <input type="hidden" name="clubId" value={membership.club.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Leave club
                  </Button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
