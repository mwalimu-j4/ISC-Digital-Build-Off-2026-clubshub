import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { getApprovedClub, getOwnMemberships, joinClub, leaveClub } from '@/modules/clubs/service';

async function membershipAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  const clubId = String(formData.get('clubId'));
  if (String(formData.get('action')) === 'leave') await leaveClub(user, clubId);
  else await joinClub(user, clubId);
  revalidatePath(`/student/clubs/${String(formData.get('slug'))}`);
  revalidatePath('/student/clubs');
  revalidatePath('/student');
}

export default async function StudentClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireRole('STUDENT');
  const slug = (await params).slug;
  const club = await getApprovedClub(slug);
  if (!club) notFound();
  const membership = (await getOwnMemberships(user)).find((item) => item.club.id === club.id);
  const canLeave = membership?.status === 'APPROVED';
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="eyebrow">{club.category}</p>
        <h1 className="mt-2 text-3xl font-semibold">{club.name}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{club.description}</p>
      </header>
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">About this club</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{club.purpose}</p>
        <h3 className="mt-6 font-medium">Activities</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {club.activities.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
        <form action={membershipAction} className="mt-6">
          <input type="hidden" name="clubId" value={club.id} />
          <input type="hidden" name="slug" value={club.slug} />
          <input type="hidden" name="action" value={canLeave ? 'leave' : 'join'} />
          <Button type="submit" variant={canLeave ? 'outline' : 'default'}>
            {canLeave
              ? 'Leave club'
              : membership?.status === 'PENDING'
                ? 'Application pending'
                : 'Join club'}
          </Button>
        </form>
      </section>
    </article>
  );
}
