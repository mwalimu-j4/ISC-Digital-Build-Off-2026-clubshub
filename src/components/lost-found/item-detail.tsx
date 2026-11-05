'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getOptimizedUrl } from '@/lib/utils/cloudinary-url';
import { CATEGORY_ICONS, CATEGORY_LABELS, STATUS_LABELS } from '@/modules/lost-found/constants';

interface ItemDetailProps {
  itemId: string;
  userId: string;
  userRole: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemData = any;

export function ItemDetail({ itemId, userId, userRole }: ItemDetailProps) {
  const [item, setItem] = useState<ItemData>(null);
  const [loading, setLoading] = useState(true);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimDesc, setClaimDesc] = useState('');
  const [claimFeature, setClaimFeature] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOfficer = userRole === 'RECOVERY_OFFICER' || userRole === 'SUPER_ADMIN';
  const isOwner = item?.reportedBy?.id === userId;

  const fetchItem = useCallback(async () => {
    try {
      const res = await fetch(`/api/lost-found/${itemId}`);
      if (!res.ok) throw new Error();
      setItem(await res.json());
    } catch {
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  const updateStatus = async (status: string, note: string) => {
    try {
      const res = await fetch(`/api/lost-found/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-status', status, note }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      fetchItem();
    } catch { toast.error('Failed to update status'); }
  };

  const runMatching = async () => {
    try {
      const res = await fetch(`/api/lost-found/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-matching' }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      toast.success(`Found ${result.matchesFound} possible match(es)`);
      fetchItem();
    } catch { toast.error('Matching failed'); }
  };

  const submitClaim = async () => {
    if (!claimDesc.trim()) { toast.error('Please describe how you can identify this item'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lost-found/${itemId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationData: { description: claimDesc, identifyingFeature: claimFeature } }),
      });
      if (!res.ok) throw new Error();
      toast.success('Ownership claim submitted successfully');
      setClaimOpen(false);
      fetchItem();
    } catch { toast.error('Failed to submit claim'); }
    finally { setSubmitting(false); }
  };

  const reviewClaim = async (claimId: string, decision: string, reason?: string) => {
    try {
      const res = await fetch(`/api/lost-found/${itemId}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review', claimId, decision, reason }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Claim ${decision}d`);
      fetchItem();
    } catch { toast.error('Failed to review claim'); }
  };

  const handoverClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/lost-found/${itemId}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'handover', claimId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Item handed over successfully!');
      fetchItem();
    } catch { toast.error('Failed to record handover'); }
  };

  if (loading) return (
    <div className="site-container py-8">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="mb-6 h-64 w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  if (!item) return (
    <div className="site-container py-16 text-center">
      <p className="text-5xl opacity-30">🔍</p>
      <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">Item not found</h2>
      <p className="mt-2 text-[var(--muted-foreground)]">This item may have been removed or the link is invalid.</p>
      <Button asChild className="mt-6 bg-[var(--primary)]"><Link href="/lost-found">Back to Lost &amp; Found</Link></Button>
    </div>
  );

  const images = Array.isArray(item.images) ? item.images : [];
  const categoryLabel = CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category;
  const categoryIcon = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS] ?? '📦';
  const statusLabel = STATUS_LABELS[item.status] ?? item.status;
  const date = new Date(item.dateOccurred).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const matches = item.reportType === 'LOST' ? item.matchesAsLost : item.matchesAsFound;

  return (
    <div className="site-container py-6 sm:py-10">
      <Link href="/lost-found" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline">
        ← Back to Lost &amp; Found
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image gallery */}
          {images.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <img src={getOptimizedUrl(images[0].url, { width: 800 })} alt={item.name} className="aspect-video w-full object-cover" />
              {images.length > 1 && (
                <div className="flex gap-1 bg-[var(--card)] p-2">
                  {images.slice(1).map((img: { url: string; publicId: string }, i: number) => (
                    <img key={img.publicId} src={getOptimizedUrl(img.url, { width: 200 })} alt={`${item.name} ${i + 2}`} className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Item info */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className={item.reportType === 'LOST' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}>
                  {item.reportType}
                </Badge>
                <Badge variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)]">
                  {statusLabel}
                </Badge>
                {item.referenceCode && (
                  <Badge variant="outline" className="border-[var(--accent)]/30 font-mono text-[var(--accent)]">
                    {item.referenceCode}
                  </Badge>
                )}
              </div>

              <h1 className="mb-1 text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
                {item.name}
              </h1>
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">{categoryIcon} {categoryLabel}</p>

              <Separator className="my-4 bg-[var(--border)]" />

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]/80">{item.description}</p>

              <Separator className="my-4 bg-[var(--border)]" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[var(--muted-foreground)]">Location</span><p className="mt-0.5 font-semibold text-[var(--foreground)]">{item.building || item.campusArea}</p></div>
                <div><span className="text-[var(--muted-foreground)]">Date</span><p className="mt-0.5 font-semibold text-[var(--foreground)]">{date}</p></div>
                {item.color && <div><span className="text-[var(--muted-foreground)]">Color</span><p className="mt-0.5 font-semibold text-[var(--foreground)]">{item.color}</p></div>}
                {item.brand && <div><span className="text-[var(--muted-foreground)]">Brand</span><p className="mt-0.5 font-semibold text-[var(--foreground)]">{item.brand}</p></div>}
                {item.specificLocation && <div className="col-span-2"><span className="text-[var(--muted-foreground)]">Specific Location</span><p className="mt-0.5 font-semibold text-[var(--foreground)]">{item.specificLocation}</p></div>}
              </div>

              {/* Owner-only details */}
              {isOwner && item.collectionLocation && (
                <>
                  <Separator className="my-4 bg-[var(--border)]" />
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <h3 className="mb-2 font-bold text-emerald-400">📍 Collection Details</h3>
                    <p className="text-sm text-[var(--foreground)]">{item.collectionLocation}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Matches */}
          {matches && matches.length > 0 && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader><CardTitle className="text-lg text-[var(--foreground)]">🔗 Possible Matches</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {matches.map((m: { id: string; score: number; status: string; foundItem?: ItemData; lostItem?: ItemData }) => {
                  const matched = m.foundItem || m.lostItem;
                  if (!matched) return null;
                  return (
                    <Link key={m.id} href={`/lost-found/${matched.id}`} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3 transition-colors hover:border-[var(--ring)]">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-[var(--foreground)]">{matched.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{matched.campusArea}</p>
                      </div>
                      <Badge variant="outline" className="border-[var(--accent)]/30 text-[var(--accent)]">
                        {Math.round(m.score)}% match
                      </Badge>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Claims */}
          {item.claims && item.claims.length > 0 && (isOwner || isOfficer) && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader><CardTitle className="text-lg text-[var(--foreground)]">📋 Ownership Claims</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {item.claims.map((c: { id: string; status: string; claimant: { id: string; fullName: string }; createdAt: string }) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{c.claimant.fullName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.status === 'APPROVED' ? 'default' : c.status === 'REJECTED' ? 'destructive' : 'outline'} className={c.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                        {c.status}
                      </Badge>
                      {isOfficer && c.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => reviewClaim(c.id, 'approve')} className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700">Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => reviewClaim(c.id, 'reject', 'Insufficient evidence')} className="h-7 text-xs">Reject</Button>
                        </div>
                      )}
                      {isOfficer && c.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => handoverClaim(c.id)} className="h-7 bg-[var(--primary)] text-xs hover:bg-[var(--primary-hover)]">
                          Record Handover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="space-y-3 pt-6">
              {item.reportType === 'FOUND' && !isOwner && (
                <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[var(--primary)] font-bold text-white hover:bg-[var(--primary-hover)]">
                      🙋 Claim This Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-[var(--border)] bg-[var(--card)]">
                    <DialogHeader><DialogTitle className="text-[var(--foreground)]">Verify Ownership</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--muted-foreground)]">Describe how you can prove this item belongs to you. Include details that were NOT publicly shown.</p>
                      <Textarea value={claimDesc} onChange={(e) => setClaimDesc(e.target.value)} placeholder="Describe specific identifying features, contents, or details..." rows={4} className="border-[var(--border)] bg-[var(--secondary)]" />
                      <Textarea value={claimFeature} onChange={(e) => setClaimFeature(e.target.value)} placeholder="Any private identifying marks or serial numbers..." rows={2} className="border-[var(--border)] bg-[var(--secondary)]" />
                      <Button onClick={submitClaim} disabled={submitting} className="w-full bg-[var(--primary)]">{submitting ? 'Submitting...' : 'Submit Claim'}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isOfficer && (
                <>
                  <Button onClick={() => updateStatus('VERIFIED', 'Item verified by officer')} variant="outline" className="w-full border-[var(--border)]">✓ Verify Report</Button>
                  <Button onClick={runMatching} variant="outline" className="w-full border-[var(--border)]">🔗 Run Matching</Button>
                  {item.status === 'READY_FOR_COLLECTION' && (
                    <Button onClick={() => updateStatus('RECOVERED', 'Item recovered')} className="w-full bg-emerald-600 hover:bg-emerald-700">🎉 Mark Recovered</Button>
                  )}
                  <Button onClick={() => updateStatus('CLOSED', 'Case closed')} variant="ghost" className="w-full text-[var(--muted-foreground)]">Close Case</Button>
                </>
              )}

              {item.recoveryTask && (
                <Button asChild variant="outline" className="w-full border-[var(--border)]">
                  <Link href={`/recovery/${item.recoveryTask.id}`}>🔍 View Recovery Task</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          {item.statusHistory && item.statusHistory.length > 0 && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader><CardTitle className="text-base text-[var(--foreground)]">📜 Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="relative space-y-0">
                  {item.statusHistory.map((entry: { id: string; status: string; note: string | null; createdAt: string; actor: { fullName: string } | null }, i: number) => (
                    <div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
                      {i < item.statusHistory.length - 1 && (
                        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-[var(--border)]" />
                      )}
                      <div className={`relative z-10 mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2 ${
                        i === item.statusHistory.length - 1
                          ? 'border-[var(--accent)] bg-[var(--accent)]/20'
                          : 'border-[var(--border)] bg-[var(--secondary)]'
                      }`}>
                        <div className={`absolute inset-1.5 rounded-full ${
                          i === item.statusHistory.length - 1 ? 'bg-[var(--accent)]' : 'bg-[var(--muted-foreground)]/40'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{STATUS_LABELS[entry.status] ?? entry.status}</p>
                        {entry.note && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{entry.note}</p>}
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]/60">
                          {new Date(entry.createdAt).toLocaleString()}
                          {entry.actor ? ` · ${entry.actor.fullName}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report info */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="pt-6 text-sm">
              <div className="space-y-2 text-[var(--muted-foreground)]">
                <div className="flex justify-between"><span>Reported by</span><span className="font-semibold text-[var(--foreground)]">{item.reportedBy?.fullName}</span></div>
                <div className="flex justify-between"><span>Reported</span><span className="font-semibold text-[var(--foreground)]">{new Date(item.createdAt).toLocaleDateString()}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
