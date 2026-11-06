export default function ProfileLoading() {
  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="h-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="h-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="h-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
