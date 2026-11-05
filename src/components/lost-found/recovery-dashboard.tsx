'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_ICONS, PRIORITY_LABELS, RECOVERY_STATUS_LABELS } from '@/modules/lost-found/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskData = any;

export function RecoveryDashboard() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/recovery');
      if (!res.ok) throw new Error();
      setTasks(await res.json());
    } catch { toast.error('Failed to load recovery tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const startSearch = async (taskId: string) => {
    try {
      const res = await fetch('/api/recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action: 'start' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Search started!');
      fetchTasks();
    } catch { toast.error('Failed to start search'); }
  };

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-amber-500/20 text-amber-400',
    LOW: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="site-container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
            🏃 Recovery Operations
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Active ground-checking tasks and recovery operations.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="border-dashed border-[var(--border)] bg-[var(--card)]/50">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <p className="text-5xl opacity-30">✓</p>
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">No active recovery tasks</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">All recovery operations are up to date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: TaskData) => {
              const checkpoints = task.checkpoints ?? [];
              const searched = checkpoints.filter((c: { searched: boolean }) => c.searched).length;
              const total = checkpoints.length;
              const progress = total > 0 ? Math.round((searched / total) * 100) : 0;
              const categoryIcon = CATEGORY_ICONS[task.item?.category as keyof typeof CATEGORY_ICONS] ?? '📦';

              return (
                <Card key={task.id} className="overflow-hidden border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--ring)]/50">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className={priorityColors[task.priority] ?? ''}>
                            {PRIORITY_LABELS[task.priority] ?? task.priority}
                          </Badge>
                          <Badge variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)]">
                            {RECOVERY_STATUS_LABELS[task.status] ?? task.status}
                          </Badge>
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-[var(--foreground)]">
                          {categoryIcon} {task.item?.name ?? 'Unknown item'}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          📍 {task.item?.building || task.item?.campusArea || 'Unknown location'}
                          {task.item?.timeOccurred && ` · 🕐 ${task.item.timeOccurred}`}
                        </p>
                        {task.assignedTo && (
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            Assigned to: <span className="font-semibold text-[var(--foreground)]">{task.assignedTo.fullName}</span>
                          </p>
                        )}
                        {total > 0 && (
                          <div className="mt-3 max-w-xs">
                            <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                              <span>Search progress</span>
                              <span className="font-semibold text-[var(--foreground)]">{searched}/{total}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 gap-2">
                        {task.status === 'PENDING' && (
                          <Button onClick={() => startSearch(task.id)} className="bg-[var(--primary)] font-bold hover:bg-[var(--primary-hover)]">
                            Start Search
                          </Button>
                        )}
                        <Button asChild variant="outline" className="border-[var(--border)]">
                          <Link href={`/recovery/${task.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
