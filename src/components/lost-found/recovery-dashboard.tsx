'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PRIORITY_LABELS, RECOVERY_STATUS_LABELS } from '@/modules/lost-found/constants';

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
    } catch {
      toast.error('Failed to load recovery tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    } catch {
      toast.error('Failed to start search');
    }
  };

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-amber-500/20 text-amber-400',
    LOW: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div>
      <div className="recovery-shell">
        <div className="mb-8">
          <p className="recovery-kicker">Campus services</p>
          <h1 className="recovery-heading mt-2 text-3xl font-extrabold sm:text-4xl">
            Ground-check operations
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Coordinate searches, update checkpoints, and keep every recovery operation moving.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card className="recovery-card border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#e8f0fb] text-xl font-bold text-[#123f88]">
                ✓
              </div>
              <h3 className="mt-4 text-lg font-bold">No active recovery tasks</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                All recovery operations are up to date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: TaskData) => {
              const checkpoints = task.checkpoints ?? [];
              const searched = checkpoints.filter((c: { searched: boolean }) => c.searched).length;
              const total = checkpoints.length;
              const progress = total > 0 ? Math.round((searched / total) * 100) : 0;
              return (
                <Card
                  key={task.id}
                  className="recovery-card overflow-hidden transition-all hover:border-[#c99a2e]"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className={priorityColors[task.priority] ?? ''}>
                            {PRIORITY_LABELS[task.priority] ?? task.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-[var(--border)] text-[var(--muted-foreground)]"
                          >
                            {RECOVERY_STATUS_LABELS[task.status] ?? task.status}
                          </Badge>
                        </div>
                        <h3 className="mb-1 text-lg font-bold">
                          {task.item?.name ?? 'Unknown item'}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {task.item?.building || task.item?.campusArea || 'Unknown location'}
                          {task.item?.timeOccurred && ` · ${task.item.timeOccurred}`}
                        </p>
                        {task.assignedTo && (
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            Assigned to:{' '}
                            <span className="font-semibold text-[var(--foreground)]">
                              {task.assignedTo.fullName}
                            </span>
                          </p>
                        )}
                        {total > 0 && (
                          <div className="mt-3 max-w-xs">
                            <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                              <span>Search progress</span>
                              <span className="font-semibold text-[var(--foreground)]">
                                {searched}/{total}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 gap-2">
                        {task.status === 'PENDING' && (
                          <Button
                            onClick={() => startSearch(task.id)}
                            className="recovery-action font-bold"
                          >
                            Start Search
                          </Button>
                        )}
                        <Button asChild variant="outline" className="recovery-secondary-action">
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
