import { Suspense } from 'react';

import { requireUser } from '@/lib/auth/authorization';
import { getProfileActivity } from '@/modules/profile';

async function ActivityList() {
  const user = await requireUser();
  const activities = await getProfileActivity(user.id, 20);

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium">
                {activity.action.replace(/_/g, ' ')}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{activity.targetEntity}</span>
                <span>•</span>
                <span className="font-mono">{activity.targetEntityId.slice(0, 8)}</span>
              </div>
              {activity.metadata && typeof activity.metadata === 'object' && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Details
                  </summary>
                  <pre className="mt-2 rounded bg-muted p-2 overflow-x-auto">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
            <time className="text-xs text-muted-foreground shrink-0">
              {new Date(activity.createdAt).toLocaleString()}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="h-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity History</h2>
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityList />
      </Suspense>
    </div>
  );
}
