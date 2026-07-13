import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {

  images: {
    // Temporary fallback while staging has no asset custom domain.
    // Move back to the validated R2 loader when Image Transformations are available.
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
