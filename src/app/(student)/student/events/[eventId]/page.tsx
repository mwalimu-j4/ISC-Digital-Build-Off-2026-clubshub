import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import {
  cancelEventRegistration,
  getEvent,
  getEventRegistration,
  registerForEvent,
} from '@/modules/events';
import { eventIdSchema } from '@/modules/events/validations/event-schema';

async function eventAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  const eventId = eventIdSchema.parse(String(formData.get('eventId')));
  const action = String(formData.get('action'));
  if (action === 'register') await registerForEvent(user, { eventId, action });
  else await cancelEventRegistration(user, { eventId, action });
  revalidatePath(`/student/events/${eventId}`);
  redirect(`/student/events/${eventId}`);
}

export default async function StudentEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requireRole('STUDENT');
  const eventId = eventIdSchema.parse((await params).eventId);
  const [event, registration] = await Promise.all([
    getEvent(user, eventId),
    getEventRegistration(user, eventId),
  ]);
  if (!event) notFound();
  const isRegistered = registration?.status === 'REGISTERED';
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">{event.club.name}</p>
        <h1 className="mt-2 text-3xl font-semibold">{event.title}</h1>
        <p className="mt-3 text-muted-foreground">
          {event.startsAt.toLocaleString()} · {event.location}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="whitespace-pre-wrap text-muted-foreground">{event.description}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          {event._count.registrations}
          {event.capacity ? ` of ${event.capacity}` : ''} registered
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={eventAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="action" value={isRegistered ? 'cancel' : 'register'} />
            <Button type="submit" variant={isRegistered ? 'outline' : 'default'}>
              {isRegistered ? 'Cancel registration' : 'Register'}
            </Button>
          </form>
          <Button asChild variant="outline">
            <a href={`/student/events/${event.id}/calendar`}>Add to calendar</a>
          </Button>
        </div>
      </div>
    </article>
  );
}
