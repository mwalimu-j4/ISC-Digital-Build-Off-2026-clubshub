'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?count=true');
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch { /* silent */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        setNotifications(await res.json());
        setLoaded(true);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchCount]);

  useEffect(() => {
    if (open && !loaded) fetchNotifications();
  }, [open, loaded, fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', id }),
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setCount(0);
    } catch { /* silent */ }
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--secondary)] transition-colors hover:border-[var(--ring)] hover:bg-[var(--card)]"
          aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        >
          <svg className="h-4 w-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-[var(--border)] bg-[var(--card)] p-0 sm:w-96" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Notifications</h3>
          {count > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto px-2 py-1 text-xs text-[var(--accent)]">
              Mark all read
            </Button>
          )}
        </div>
        <Separator className="bg-[var(--border)]" />
        <ScrollArea className="max-h-80">
          {!loaded ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-[var(--accent)]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-2xl opacity-30">🔔</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--secondary)] ${!n.read ? 'bg-[var(--primary)]/5' : ''}`}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />}
                  <div className={`min-w-0 flex-1 ${n.read ? 'pl-5' : ''}`}>
                    <p className={`truncate text-sm ${n.read ? 'text-[var(--muted-foreground)]' : 'font-semibold text-[var(--foreground)]'}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted-foreground)]">{n.message}</p>
                    <p className="mt-1 text-[10px] text-[var(--muted-foreground)]/60">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator className="bg-[var(--border)]" />
        <div className="p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs text-[var(--accent)]" onClick={() => setOpen(false)}>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
