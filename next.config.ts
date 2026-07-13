import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },

  images: {
    unoptimized: true,
    qualities: [60, 75, 85],
  },

  outputFileTracingExcludes: {
    "/*": [
      "**/node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm",
      "**/node_modules/@prisma/client/runtime/query_engine_bg.mysql.wasm",
    ],
  },
};

export default nextConfig;
