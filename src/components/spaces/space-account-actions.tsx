'use client';

import { signIn, signOut } from 'next-auth/react';

export function SpaceAccountActions() {
  return (
    <>
      <button
        onClick={() =>
          signIn('google', { callbackUrl: '/auth/redirect', prompt: 'select_account' })
        }
        type="button"
      >
        Switch account
      </button>
      <button onClick={() => signOut({ callbackUrl: '/' })} type="button">
        Sign out
      </button>
    </>
  );
}
