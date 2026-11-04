'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-semibold">Sign in to ClubsHub</h1>
      <p className="mt-3 text-muted-foreground">
        Use your approved university account to continue.
      </p>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="mt-8 w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground"
      >
        Continue with Google
      </button>
    </main>
  );
}
