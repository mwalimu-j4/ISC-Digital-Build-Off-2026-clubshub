'use client';

import { useEffect } from 'react';

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error.digest) {
      document.title = 'Student dashboard unavailable';
    }
  }, [error.digest]);

  return (
    <div className="rounded-xl border border-destructive/50 bg-card p-8 text-center">
      <h1 className="text-xl font-semibold">We could not load this page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please try again. Your account and data have not been changed.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
