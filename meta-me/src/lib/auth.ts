import NextAuth from 'next-auth';
import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith('/diary') ||
        nextUrl.pathname.startsWith('/report') ||
        nextUrl.pathname.startsWith('/objectify');

      if (isOnDashboard && !isLoggedIn) return false;
      return true;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
// 뭔가 해야함. 그런데 게으름이 문제다.