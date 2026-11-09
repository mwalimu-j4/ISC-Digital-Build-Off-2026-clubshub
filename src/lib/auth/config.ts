import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/database/prisma';

function getDisplayName(name: string | null | undefined, email: string) {
  return name?.trim() || email.split('@')[0] || 'ClubsHub student';
}

async function findOrCreateGoogleUser(user: { email?: string | null; name?: string | null }) {
  const email = user.email?.trim().toLowerCase();
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    // eslint-disable-next-line no-console
    console.error('signIn denied: Google account did not provide an email address');
    return null;
  }

  try {
    const account = await prisma.user.findUnique({ where: { email } });

    if (account) {
      if (email === superAdminEmail && account.role !== 'SUPER_ADMIN') {
        return prisma.user.update({
          where: { id: account.id },
          data: { role: 'SUPER_ADMIN' },
        });
      }

      return account;
    }

    const created = await prisma.user.create({
      data: {
        fullName: getDisplayName(user.name, email),
        email,
        studentRegistrationId: `google-${crypto.randomUUID()}`,
        role: email === superAdminEmail ? 'SUPER_ADMIN' : 'STUDENT',
        status: 'ACTIVE',
      },
    });

    // eslint-disable-next-line no-console
    console.log(`signIn: created student account for ${email}`);
    return created;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `signIn failed: could not find or create account for ${email}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  callbacks: {
    async signIn({ user }) {
      const account = await findOrCreateGoogleUser(user);

      if (!account) {
        // eslint-disable-next-line no-console
        console.error(
          `signIn denied: no active account could be established for ${user.email ?? 'unknown email'}`,
        );
        return false;
      }

      if (account.status !== 'ACTIVE') {
        // eslint-disable-next-line no-console
        console.error(`signIn denied: account status is ${account.status} for ${account.email}`);
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email || token.email || token.id) {
        const account = await prisma.user.findUnique({
          where: token.id
            ? { id: token.id }
            : { email: (user?.email ?? token.email)?.toLowerCase() },
          select: { id: true, role: true, status: true },
        });

        if (account) {
          token.id = account.id;
          token.role = account.role;
          token.status = account.status;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }

      return session;
    },
  },
};
