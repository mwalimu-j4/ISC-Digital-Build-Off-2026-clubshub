import './globals.css';

import type { Metadata } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { AuthSessionProvider } from '@/components/shared/auth-session-provider';
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav';

export const metadata: Metadata = {
  title: 'ClubsHub | Find your people on campus',
  description: 'The campus platform for clubs, events, announcements, and lost & found.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: '400',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrumentSerif.variable}`}>
        <AuthSessionProvider>
          {children}
          <MobileBottomNav />
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
