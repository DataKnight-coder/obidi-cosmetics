import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/r2-loader.ts",
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
