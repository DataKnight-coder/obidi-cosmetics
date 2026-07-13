import type { ImageLoaderProps } from "next/image";

export default function r2Loader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

  if (!assetBaseUrl) {
    throw new Error("NEXT_PUBLIC_ASSET_BASE_URL is not configured");
  }

  // Security filters: reject invalid, unsafe, or arbitrary external origins
  if (
    src.startsWith("javascript:") ||
    src.startsWith("data:") ||
    src.includes("..") ||
    src.includes("://") || // Rejects external protocol origins
    src.includes("<") ||
    src.includes(">")
  ) {
    throw new Error("Forbidden URL pattern in image loader");
  }

  const normalizedSrc = src.replace(/^\/+/, "");
  const cleanBaseUrl = assetBaseUrl.replace(/\/$/, "");
  const originalUrl = `${cleanBaseUrl}/${normalizedSrc}`;

  if (process.env.NODE_ENV === "development") {
    return originalUrl;
  }

  const parameters = [
    `width=${width}`,
    `quality=${quality ?? 75}`,
    "format=auto",
    "fit=scale-down",
  ].join(",");

  return `${cleanBaseUrl}/cdn-cgi/image/${parameters}/${originalUrl}`;
}
