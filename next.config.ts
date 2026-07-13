import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/r2-loader.ts",
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
