import { PrismaClient } from '@prisma/client/edge';
import { PrismaD1 } from '@prisma/adapter-d1';
import { cache } from 'react';

// Create an environment-aware Prisma factory cached per-request
export const getPrisma = cache(() => {
  // OpenNext injects Cloudflare bindings into process.env
  const dbBinding = process.env.DB as any;

  if (dbBinding) {
    const adapter = new PrismaD1(dbBinding);
    return new PrismaClient({ adapter });
  }

  // Fallback
  return new PrismaClient();
});

// For backward compatibility in existing files (if they rely on global `prisma`)
// WARNING: This is not request-scoped. Existing Server Actions/Handlers should be updated to use getPrisma()
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
