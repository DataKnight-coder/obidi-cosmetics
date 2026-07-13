import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Temporary fallback while staging has no asset custom domain.
    // Move back to the validated R2 loader when Image Transformations are available.
    unoptimized: true,
    qualities: [60, 75, 85],
  },
  experimental: {
    serverExternalPackages: ["@prisma/client", "bcryptjs"]
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
