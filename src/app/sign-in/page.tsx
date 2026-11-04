'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/" aria-label="ClubsHub home">
        <span className="auth-brand-mark" aria-hidden="true">
          C
        </span>
        <span>ClubsHub</span>
      </Link>
      <section className="auth-card" aria-labelledby="sign-in-heading">
        <div className="auth-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Z" />
            <path d="m9.5 12 1.7 1.7 3.5-3.5" />
          </svg>
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1 id="sign-in-heading">Sign in to ClubsHub</h1>
        <p className="auth-description">
          Use your approved university account to discover clubs, events, and your campus community.
        </p>
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="auth-google-button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.22Z"
            />
            <path
              fill="#34A853"
              d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z"
            />
            <path
              fill="#FBBC05"
              d="M6.54 13.75a5.85 5.85 0 0 1 0-3.5V7.72H3.3a9.75 9.75 0 0 0 0 8.56l3.24-2.53Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.22c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 7.94 9.46 6.22 12 6.22Z"
            />
          </svg>
          Continue with Google
        </button>
        <div className="auth-divider">
          <span>Campus access</span>
        </div>
        <p className="auth-registration-note">
          New to ClubsHub? Accounts are provisioned by your university. Contact your campus
          administrator to register.
        </p>
      </section>
      <p className="auth-footer">
        <span aria-hidden="true">●</span> Secure campus sign-in
      </p>
    </main>
  );
}
