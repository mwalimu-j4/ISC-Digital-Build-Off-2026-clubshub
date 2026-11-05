'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export function NotificationsFullPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) setNotifications(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-read', id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="site-container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/lost-found" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline">← Back</Link>
            <h1 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>Notifications</h1>
          </div>
          {notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="border-[var(--border)] text-xs">Mark all read</Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : notifications.length === 0 ? (
          <Card className="border-dashed border-[var(--border)] bg-[var(--card)]/50">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <p className="text-5xl opacity-30">🔔</p>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">No notifications</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">You&apos;re all caught up. Notifications will appear here when there are updates.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-[var(--ring)]/50 ${
                  n.read ? 'border-[var(--border)] bg-[var(--card)]' : 'border-[var(--primary)]/20 bg-[var(--primary)]/5'
                }`}
              >
                {!n.read && <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--primary)]" />}
                <div className={`min-w-0 flex-1 ${n.read ? 'pl-[22px]' : ''}`}>
                  <p className={`text-sm ${n.read ? 'text-[var(--muted-foreground)]' : 'font-bold text-[var(--foreground)]'}`}>{n.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{n.message}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]/60">{timeAgo(n.createdAt)}</p>
                </div>
                {n.actionUrl && <span className="mt-1 text-xs text-[var(--accent)]">→</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
