import { requireRole } from "@/lib/auth/require-role";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type ImageStorageEnv = CloudflareEnv & {
  PRODUCT_IMAGES?: R2Bucket;
};

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN", "CATALOG_MANAGER"]);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose an image to upload." }, { status: 400 });
    }

    const extension = ALLOWED_IMAGE_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, WebP, GIF, or AVIF image." },
        { status: 415 },
      );
    }

    if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Images must be smaller than 10 MB." },
        { status: 413 },
      );
    }

    const { env } = getCloudflareContext();
    const bucket = (env as ImageStorageEnv).PRODUCT_IMAGES;

    if (!bucket) {
      return NextResponse.json({ error: "Image storage is unavailable." }, { status: 503 });
    }

    const objectKey = `products/${crypto.randomUUID()}.${extension}`;

    await bucket.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        originalName: file.name.slice(0, 512),
      },
    });

    const url = new URL(`/media/${encodeURIComponent(objectKey)}`, request.url).toString();

    return NextResponse.json({ url, objectKey }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "Forbidden" || message.startsWith("Unauthorized") ? 403 : 500;

    console.error("Product image upload failed:", error);
    return NextResponse.json(
      { error: status === 403 ? "You are not allowed to upload product images." : "The image could not be uploaded." },
      { status },
    );
  }
}
