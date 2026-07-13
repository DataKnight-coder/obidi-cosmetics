import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).sessionVersion = token.sessionVersion;
      } else {
        (session as any).user = null;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
} satisfies NextAuthConfig;
