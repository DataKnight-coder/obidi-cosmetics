import { applyD1Migrations, env } from "cloudflare:test";

// @ts-ignore
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
