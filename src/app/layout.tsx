import './globals.css';

import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { AuthSessionProvider } from '@/components/shared/auth-session-provider';

export const metadata: Metadata = {
  title: 'ClubsHub | Find your people on campus',
  description: 'The campus platform for clubs, events, announcements, and lost & found.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
