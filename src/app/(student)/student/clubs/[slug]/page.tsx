import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

import { JoinRequestForm } from '@/components/student/join-request-form';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { getApprovedClub, getOwnMemberships, joinClub, leaveClub } from '@/modules/clubs/service';
import { submitJoinRequest } from '@/modules/join-requests';

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

async function requestAction(_: { error?: string; success?: boolean }, formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  try {
    await submitJoinRequest(user, String(formData.get('clubId')), {
      fullName: formData.get('fullName'),
      schoolId: formData.get('schoolId'),
      department: formData.get('department'),
      major: formData.get('major'),
      saveDetails: formData.get('saveDetails') === 'on',
    });
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to send request.' };
  }
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
        <div className="mt-6">
          {canLeave ? (
            <form action={membershipAction}>
              <input type="hidden" name="clubId" value={club.id} />
              <input type="hidden" name="slug" value={club.slug} />
              <input type="hidden" name="action" value="leave" />
              <Button type="submit" variant="outline">
                Leave club
              </Button>
            </form>
          ) : membership?.status === 'PENDING' ? (
            <Button disabled type="button">
              Request pending
            </Button>
          ) : (
            <JoinRequestForm action={requestAction} clubId={club.id} />
          )}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <p className="mt-3 text-sm text-muted-foreground">This club has no announcements yet.</p>
      </section>
    </article>
  );
}
