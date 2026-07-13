import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, "prisma/migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "../.open-next/worker.js": path.resolve(__dirname, "./tests/open-next-worker-stub.ts"),
      },
    },
    plugins: [
      cloudflareTest({
        wrangler: {
          configPath: "./wrangler.jsonc",
          environment: "staging",
        },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
          },
        },
      }),
    ],
    test: {
      setupFiles: ["./tests/apply-migrations.ts"],
    },
  };
});
