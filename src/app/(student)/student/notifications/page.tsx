import { revalidatePath } from 'next/cache';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { listNotifications, updateNotifications } from '@/modules/notifications';

async function markAllRead() {
  'use server';
  const user = await requireRole('STUDENT');
  await updateNotifications(user, { action: 'mark-all-read' });
  revalidatePath('/student/notifications');
}

async function markRead(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  await updateNotifications(user, { action: 'mark-read', id: String(formData.get('id')) });
  revalidatePath('/student/notifications');
}

export default async function StudentNotificationsPage() {
  const user = await requireRole('STUDENT');
  const notifications = await listNotifications(user);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your updates</p>
          <h1 className="mt-2 text-3xl font-semibold">Notifications</h1>
        </div>
        {notifications.some((item) => !item.read) && (
          <form action={markAllRead}>
            <Button type="submit" variant="outline">
              Mark all as read
            </Button>
          </form>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">You are all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border border-border bg-card p-5 ${notification.read ? '' : 'border-primary/50'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{notification.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <time className="mt-3 block text-xs text-muted-foreground">
                    {notification.createdAt.toLocaleString()}
                  </time>
                </div>
                {!notification.read && (
                  <form action={markRead}>
                    <input type="hidden" name="id" value={notification.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Mark read
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
