export default function StudentLoading() {
  return (
    <div className="space-y-6" aria-label="Loading student dashboard">
      <div className="h-10 w-72 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
