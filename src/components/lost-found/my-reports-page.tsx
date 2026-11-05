'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ItemCard, ItemCardSkeleton } from '@/components/lost-found/item-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemData = any;

export function MyReportsPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/lost-found?my=true');
        if (res.ok) setItems(await res.json());
      } catch { toast.error('Failed to load reports'); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'ALL' ? items : items.filter((i: ItemData) => i.reportType === filter);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="site-container py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/lost-found" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline">
              ← Back to Lost &amp; Found
            </Link>
            <h1 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>My Reports</h1>
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-[var(--secondary)]">
              <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="LOST" className="text-xs">Lost</TabsTrigger>
              <TabsTrigger value="FOUND" className="text-xs">Found</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-[var(--border)] bg-[var(--card)]/50">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <p className="text-5xl opacity-30">📋</p>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">No reports yet</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">You haven&apos;t submitted any lost or found reports. Start by reporting an item.</p>
              <div className="mt-6 flex gap-3">
                <Button asChild className="bg-[var(--primary)]"><Link href="/lost-found/report-lost">Report Lost</Link></Button>
                <Button asChild variant="outline" className="border-[var(--border)]"><Link href="/lost-found/report-found">Report Found</Link></Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item: ItemData) => <ItemCard key={item.id} {...item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
