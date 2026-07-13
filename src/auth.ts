import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
  ]
});
