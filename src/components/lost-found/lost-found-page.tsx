'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ItemCard, ItemCardSkeleton } from '@/components/lost-found/item-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CAMPUS_AREAS, CATEGORY_LABELS } from '@/modules/lost-found/constants';

interface Stats {
  activeLost: number;
  foundItems: number;
  searches: number;
  recovered: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemData = any;

export function LostFoundPage() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [campusArea, setCampusArea] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (reportType) params.set('reportType', reportType);
      if (category) params.set('category', category);
      if (campusArea) params.set('campusArea', campusArea);
      params.set('limit', '20');

      const res = await fetch(`/api/lost-found?${params}`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [search, reportType, category, campusArea]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/lost-found?stats=true');
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setLoading(true);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => fetchItems(), 350);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, reportType, category, campusArea]);

  const clearFilters = () => {
    setSearch('');
    setReportType('');
    setCategory('');
    setCampusArea('');
  };

  const hasFilters = search || reportType || category || campusArea;

  const FilterControls = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted-foreground)]">Type</label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full border-[var(--border)] bg-[var(--secondary)]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="LOST">Lost Items</SelectItem>
            <SelectItem value="FOUND">Found Items</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted-foreground)]">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full border-[var(--border)] bg-[var(--secondary)]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted-foreground)]">Location</label>
        <Select value={campusArea} onValueChange={setCampusArea}>
          <SelectTrigger className="w-full border-[var(--border)] bg-[var(--secondary)]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All locations</SelectItem>
            {CAMPUS_AREAS.map((area) => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-[var(--accent)]">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--secondary)]/60 to-[var(--background)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,106,0,0.08),transparent_60%)]" />
        <div className="site-container relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Campus Recovery System
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl" style={{ letterSpacing: '-0.04em', lineHeight: '1.05' }}>
              Campus Lost{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">&amp; Found</span>
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-base text-[var(--muted-foreground)] sm:text-lg" style={{ lineHeight: '1.7' }}>
              Report, locate, and recover lost property across campus. Our ground-checking system actively searches for your belongings.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full rounded-full bg-[var(--primary)] px-8 font-bold text-white hover:bg-[var(--primary-hover)] sm:w-auto">
                <Link href="/lost-found/report-lost">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Report Lost Item
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full rounded-full border-[var(--border)] bg-[var(--card)] font-bold text-[var(--foreground)] hover:border-[var(--ring)] hover:bg-[var(--secondary)] sm:w-auto">
                <Link href="/lost-found/report-found">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Report Found Item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-b border-[var(--border)] bg-[var(--card)]/50">
          <div className="site-container py-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Active Lost Reports', value: stats.activeLost, icon: '🔍', color: 'text-red-400' },
                { label: 'Found Items', value: stats.foundItems, icon: '✓', color: 'text-emerald-400' },
                { label: 'Active Searches', value: stats.searches, icon: '🏃', color: 'text-amber-400' },
                { label: 'Recovered', value: stats.recovered, icon: '🎉', color: 'text-[var(--accent)]' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="sticky top-[76px] z-10 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl sm:top-[76px]">
        <div className="site-container py-4">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="search"
                placeholder="Search by name, description, location, or reference code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-[var(--border)] bg-[var(--card)] pl-10 text-sm placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            {/* Desktop filters */}
            <div className="hidden items-center gap-2 lg:flex">
              <Tabs value={reportType || 'ALL'} onValueChange={(v) => setReportType(v === 'ALL' ? '' : v)}>
                <TabsList className="bg-[var(--secondary)]">
                  <TabsTrigger value="ALL" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="LOST" className="text-xs">Lost</TabsTrigger>
                  <TabsTrigger value="FOUND" className="text-xs">Found</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={category} onValueChange={(v) => setCategory(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-40 border-[var(--border)] bg-[var(--card)] text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={campusArea} onValueChange={(v) => setCampusArea(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-40 border-[var(--border)] bg-[var(--card)] text-xs">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All locations</SelectItem>
                  {CAMPUS_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-[var(--accent)]">
                  Clear
                </Button>
              )}
            </div>

            {/* Mobile filter button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden border-[var(--border)] bg-[var(--card)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {hasFilters && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl border-[var(--border)] bg-[var(--card)]">
                <SheetHeader>
                  <SheetTitle className="text-[var(--foreground)]">Filter Items</SheetTitle>
                </SheetHeader>
                <div className="mt-4 pb-6">
                  <FilterControls />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="site-container py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} found`}
          </p>
          <Link href="/lost-found/my-reports" className="text-sm font-semibold text-[var(--accent)] hover:underline">
            My Reports →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-dashed border-[var(--border)] bg-[var(--card)]/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-5xl opacity-40">📭</div>
              <h3 className="mb-2 text-lg font-bold text-[var(--foreground)]">No items found</h3>
              <p className="mb-6 max-w-sm text-sm text-[var(--muted-foreground)]">
                {hasFilters
                  ? 'No items match your current filters. Try adjusting the category, location, or search terms.'
                  : 'No lost or found items have been reported yet. Be the first to help the campus community.'}
              </p>
              <div className="flex gap-3">
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="border-[var(--border)]">
                    Clear filters
                  </Button>
                )}
                <Button asChild className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]">
                  <Link href="/lost-found/report-lost">Report an item</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item: ItemData) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
