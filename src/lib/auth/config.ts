import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@/lib/database/prisma';

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
      if (!user.email) {
        return false;
      }

      const account = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { status: true },
      });

      return account?.status === 'ACTIVE';
    },
    async jwt({ token, user }) {
      if (user?.email || token.email) {
        const account = await prisma.user.findUnique({
          where: { email: (user?.email ?? token.email)?.toLowerCase() },
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
