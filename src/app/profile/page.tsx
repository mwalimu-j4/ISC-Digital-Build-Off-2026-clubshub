import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import { requireUser } from '@/lib/auth/authorization';
import { getProfileActivity } from '@/modules/profile';

function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="size-20 animate-pulse rounded-full bg-muted sm:size-24" />
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-5 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function ProfileStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

async function RecentActivity() {
  const user = await requireUser();
  const activities = await getProfileActivity(user.id, 3);

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{activity.action.replace(/_/g, ' ')}</p>
              <p className="text-xs text-muted-foreground">
                {activity.targetEntity} • {activity.targetEntityId.slice(0, 8)}
              </p>
            </div>
            <time className="text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();

  if (user.role === 'STUDENT') {
    redirect('/student');
  }

  return (
    <div className="space-y-8">
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeader />
      </Suspense>

      <Suspense fallback={<ProfileStatsSkeleton />}>
        <ProfileStats />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent activity</h2>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
