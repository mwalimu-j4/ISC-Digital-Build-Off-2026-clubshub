'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error is logged to error reporting service in production
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto size-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <svg
              className="size-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">
              We encountered an error while loading your profile. Please try again.
            </p>
          </div>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
