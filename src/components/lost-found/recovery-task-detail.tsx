'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  RECOVERY_STATUS_LABELS,
  STATUS_LABELS,
} from '@/modules/lost-found/constants';

interface RecoveryTaskDetailProps {
  taskId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskData = any;

export function RecoveryTaskDetail({ taskId }: RecoveryTaskDetailProps) {
  const [task, setTask] = useState<TaskData>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/recovery?taskId=${taskId}`);
      if (!res.ok) throw new Error();
      setTask(await res.json());
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action, notes }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Action completed: ${action}`);
      fetchTask();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const updateCheckpoint = async (checkpointId: string, searched: boolean, checkNotes?: string) => {
    try {
      const res = await fetch('/api/recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkpoint', checkpointId, searched, notes: checkNotes }),
      });
      if (!res.ok) throw new Error();
      toast.success(searched ? 'Area marked as searched' : 'Checkpoint updated');
      fetchTask();
    } catch {
      toast.error('Failed to update checkpoint');
    }
  };

  if (loading)
    return (
      <div className="site-container py-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-6 h-48 w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );

  if (!task)
    return (
      <div className="site-container py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e8f0fb] text-xl font-bold text-[#123f88]">
          !
        </div>
        <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">Task not found</h2>
        <Button asChild className="recovery-action mt-6">
          <Link href="/recovery">Back to operations</Link>
        </Button>
      </div>
    );

  const checkpoints = task.checkpoints ?? [];
  const searched = checkpoints.filter((c: { searched: boolean }) => c.searched).length;
  const total = checkpoints.length;
  const progress = total > 0 ? Math.round((searched / total) * 100) : 0;

  return (
    <div className="recovery-shell py-6 sm:py-10">
      <Link
        href="/recovery"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#a87818] hover:underline"
      >
        Back to operations
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Task header */}
          <Card className="recovery-card">
            <CardContent className="pt-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    task.priority === 'URGENT'
                      ? 'bg-red-500/20 text-red-400'
                      : task.priority === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-amber-500/20 text-amber-400'
                  }
                >
                  {PRIORITY_LABELS[task.priority]} Priority
                </Badge>
                <Badge variant="outline" className="border-[var(--border)]">
                  {RECOVERY_STATUS_LABELS[task.status]}
                </Badge>
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#102a56]">
                Recovery: {task.item?.name}
              </h1>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--muted-foreground)]">Category</span>
                  <p className="font-semibold text-[var(--foreground)]">
                    {CATEGORY_LABELS[task.item?.category as keyof typeof CATEGORY_LABELS] ??
                      task.item?.category}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Location</span>
                  <p className="font-semibold text-[var(--foreground)]">
                    {task.item?.building || task.item?.campusArea}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Last Seen</span>
                  <p className="font-semibold text-[var(--foreground)]">
                    {task.item?.dateOccurred
                      ? new Date(task.item.dateOccurred).toLocaleDateString()
                      : '—'}{' '}
                    {task.item?.timeOccurred || ''}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Status</span>
                  <p className="font-semibold text-[var(--foreground)]">
                    {STATUS_LABELS[task.item?.status] ?? task.item?.status}
                  </p>
                </div>
              </div>
              {task.item?.description && (
                <>
                  <Separator className="my-4 bg-[var(--border)]" />
                  <p className="text-sm text-[var(--foreground)]/80">{task.item.description}</p>
                </>
              )}
              {task.item?.locationNotes && (
                <p className="mt-2 text-sm text-[var(--accent)]">{task.item.locationNotes}</p>
              )}
            </CardContent>
          </Card>

          {/* Ground Search Checklist */}
          <Card className="recovery-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#102a56]">Ground search checklist</CardTitle>
                <span className="text-sm font-bold text-[var(--accent)]">
                  {searched}/{total}
                </span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </CardHeader>
            <CardContent className="space-y-2">
              {checkpoints.map(
                (cp: {
                  id: string;
                  areaName: string;
                  searched: boolean;
                  notes: string | null;
                  searchedAt: string | null;
                  searchedBy: { fullName: string } | null;
                }) => (
                  <div
                    key={cp.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                      cp.searched ? 'border-emerald-500/30 bg-emerald-500/5' : 'recovery-card-muted'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => updateCheckpoint(cp.id, !cp.searched)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        cp.searched
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-[#b9c9de] hover:border-[#c99a2e]'
                      }`}
                      aria-label={`Mark ${cp.areaName} as ${cp.searched ? 'not searched' : 'searched'}`}
                    >
                      {cp.searched && <span className="text-xs">✓</span>}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${cp.searched ? 'text-emerald-700' : 'text-[#102a56]'}`}
                      >
                        {cp.areaName}
                      </p>
                      {cp.searchedBy && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Searched by {cp.searchedBy.fullName} ·{' '}
                          {cp.searchedAt ? new Date(cp.searchedAt).toLocaleTimeString() : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-base text-[var(--foreground)]">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Search notes..."
                rows={3}
                className="border-[var(--border)] bg-[var(--secondary)]"
              />
              {task.status === 'PENDING' && (
                <Button
                  onClick={() => handleAction('start')}
                  disabled={actionLoading}
                  className="w-full bg-[var(--primary)] font-bold hover:bg-[var(--primary-hover)]"
                >
                  🚀 Start Search
                </Button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <>
                  <Button
                    onClick={() => handleAction('complete-found')}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
                  >
                    ✓ Complete — Item Found
                  </Button>
                  <Button
                    onClick={() => handleAction('complete-not-found')}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-[var(--border)]"
                  >
                    ✕ Complete — Not Found
                  </Button>
                  <Button
                    onClick={() => handleAction('escalate')}
                    disabled={actionLoading}
                    variant="ghost"
                    className="w-full text-amber-400"
                  >
                    ⚠ Escalate
                  </Button>
                </>
              )}
              <Button asChild variant="outline" className="w-full border-[var(--border)]">
                <Link href={`/lost-found/${task.itemId}`}>View Item Details</Link>
              </Button>
            </CardContent>
          </Card>

          {task.assignedTo && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardContent className="pt-6 text-sm">
                <p className="text-[var(--muted-foreground)]">Assigned Officer</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">
                  {task.assignedTo.fullName}
                </p>
                {task.startedAt && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Started: {new Date(task.startedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
