import { requireUser } from '@/lib/auth/authorization';
import { getProfileStats } from '@/modules/profile';

export async function ProfileStats() {
  const user = await requireUser();
  const stats = await getProfileStats(user.id);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Clubs Joined</p>
          <p className="text-2xl font-bold">{stats.clubsJoined}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Items Reported</p>
          <p className="text-2xl font-bold">{stats.itemsReported}</p>
        </div>
      </div>
    </div>
  );
}
