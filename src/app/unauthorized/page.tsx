export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Access denied</h1>
      <p className="mt-3 text-muted-foreground">
        Your account does not have permission to view this page.
      </p>
    </main>
  );
}
