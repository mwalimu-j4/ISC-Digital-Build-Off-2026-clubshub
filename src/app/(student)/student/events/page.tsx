import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { listUpcomingEvents } from '@/modules/events';

export default async function StudentEventsPage() {
  const user = await requireRole('STUDENT');
  const events = await listUpcomingEvents(user);
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">What is happening</p>
        <h1 className="mt-2 text-3xl font-semibold">Upcoming events</h1>
        <p className="mt-2 text-muted-foreground">
          See what is happening across your clubs and campus.
        </p>
      </section>
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No upcoming events have been published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-medium text-primary">{event.club.name}</p>
              <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {event.startsAt.toLocaleString()} · {event.location}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
              <Button asChild className="mt-5" variant="outline">
                <Link href={`/student/events/${event.id}`}>View details</Link>
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
