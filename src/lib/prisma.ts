import { PrismaClient } from '../generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type CloudflareDatabaseEnv = CloudflareEnv & { DB?: D1Database };

const globalForPrisma = globalThis as typeof globalThis & {
  cloudflarePrisma?: PrismaClient;
  localPrisma?: PrismaClient;
};

function getCloudflareDatabase(): D1Database | undefined {
  try {
    const { env } = getCloudflareContext();
    const db = (env as CloudflareDatabaseEnv).DB;

    if (!db) {
      throw new Error('The Cloudflare DB binding is not configured.');
    }

    return db;
  } catch (error) {
    // During `next build`, OpenNext has not installed a request context yet.
    // Let Prisma use the local SQLite datasource for build-time rendering only.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return undefined;
    }

    throw error;
  }
}

export function getPrisma(): PrismaClient {
  const db = getCloudflareDatabase();

  if (db) {
    globalForPrisma.cloudflarePrisma ??= new PrismaClient({
      adapter: new PrismaD1(db),
    });

    return globalForPrisma.cloudflarePrisma;
  }

  globalForPrisma.localPrisma ??= new PrismaClient();
  return globalForPrisma.localPrisma;
}

// Existing call sites keep the familiar `prisma.model` API, but the real client
// is not created until a request has made the Cloudflare bindings available.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
