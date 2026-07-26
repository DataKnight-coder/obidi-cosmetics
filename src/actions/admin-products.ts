"use server";

import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Product slug is required.")
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens in the slug."),
  description: z.string().trim().min(1, "Description is required.").max(10_000),
  shortDescription: z.string().trim().max(500),
  categoryId: z.string().trim().min(1, "Please select a category.").max(191),
  priceNaira: z.number().finite().positive("Price must be greater than zero.").max(100_000_000),
  stock: z.number().int().min(0, "Stock cannot be negative.").max(1_000_000_000),
  images: z
    .array(
      z.object({
        url: z.url(),
        objectKey: z.string().trim().min(1).max(1024),
      }),
    )
    .max(12, "You can upload up to 12 images per product."),
});

export type CreateProductInput = z.input<typeof createProductSchema>;

export async function createProductAction(data: CreateProductInput) {
  try {
    await requireRole(["SUPER_ADMIN", "CATALOG_MANAGER"]);

    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Please check the product details and try again.",
      };
    }

    const productData = parsed.data;
    const [existingProduct, category] = await Promise.all([
      prisma.product.findUnique({
        where: { slug: productData.slug },
        select: { id: true },
      }),
      prisma.category.findUnique({
        where: { id: productData.categoryId },
        select: { id: true },
      }),
    ]);

    if (existingProduct) {
      return { success: false, error: "A product with this slug already exists." };
    }

    if (!category) {
      return { success: false, error: "The selected category no longer exists. Please choose another one." };
    }

    const priceKobo = Math.round(productData.priceNaira * 100);

    await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        shortDescription: productData.shortDescription || productData.description.substring(0, 100),
        categoryId: productData.categoryId,
        featuredImage: productData.images[0]?.url || "/assets/placeholder.jpg",
        variants: {
          create: {
            name: "Default",
            sku: `${productData.slug.toUpperCase()}-DEF`,
            priceKobo,
            stockQuantity: productData.stock,
          },
        },
        productImages: {
          create: productData.images.map((image, index) => ({
            url: image.url,
            objectKey: image.objectKey,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/shop");

    return { success: true };
  } catch (error: unknown) {
    console.error("Create Product Error:", error);
    return {
      success: false,
      error: "The product could not be saved. Please try again. If it continues, contact support.",
    };
  }
}
