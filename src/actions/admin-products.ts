"use server";

import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  priceKobo: number;
  stock: number;
  images: { url: string; objectKey: string }[];
};

export async function createProductAction(data: CreateProductInput) {
  try {
    // 1. Authorize - only CATALOG_MANAGER or SUPER_ADMIN
    await requireRole(["SUPER_ADMIN", "CATALOG_MANAGER"]);

    // 2. Validate basic constraints
    if (!data.name || !data.slug || !data.categoryId) {
      return { success: false, error: "Name, slug, and category are required." };
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug }
    });

    if (existingProduct) {
      return { success: false, error: "A product with this slug already exists." };
    }

    // 3. Create the product, initial variant, and images
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription || data.description.substring(0, 100),
          categoryId: data.categoryId,
          featuredImage: data.images.length > 0 ? data.images[0].url : "/assets/placeholder.jpg",
          variants: {
            create: {
              name: "Default",
              sku: `${data.slug.toUpperCase()}-DEF`,
              priceKobo: data.priceKobo,
              stockQuantity: data.stock,
            }
          },
          productImages: {
            create: data.images.map((img, index) => ({
              url: img.url,
              objectKey: img.objectKey,
              isPrimary: index === 0,
              sortOrder: index,
            }))
          }
        }
      });
      return product;
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/shop");

    return { success: true };
  } catch (error: any) {
    console.error("Create Product Error:", error.message);
    return { success: false, error: error.message || "Failed to create product." };
  }
}
