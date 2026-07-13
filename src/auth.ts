import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const token = credentials.turnstileToken as string;
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        const isProdOrStaging = process.env.NODE_ENV === "production";
        
        if (turnstileSecret && token) {
          const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${turnstileSecret}&response=${token}`,
          });
          const outcome = await res.json() as any;
          if (!outcome.success) {
            console.error("Turnstile verification failed", outcome);
            return null;
          }
        } else if (isProdOrStaging) {
           console.error("TURNSTILE_SECRET_KEY or token missing in production/staging. Failing closed.");
           return null;
        } else {
           console.warn("TURNSTILE_SECRET_KEY not set. Skipping Turnstile verification (dev mode).");
        }

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordsMatch) {
          return null;
        }

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.sessionVersion = (user as any).sessionVersion;
      }
      
      if (token.id) {
        // Validate session against database (handles password resets and deactivations)
        const dbUser = await prisma.adminUser.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true, isActive: true, role: true }
        });
        
        if (!dbUser || !dbUser.isActive || dbUser.sessionVersion !== token.sessionVersion) {
          // Token is invalidated because user reset password, was deactivated, or deleted.
          // Returning an empty token effectively revokes the session.
          return {};
        }
        token.role = dbUser.role; // keep role fresh
      }
      
      // If the token was invalidated, it won't have an id anymore.
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      } else {
        // If token has no ID, the session is invalid
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
