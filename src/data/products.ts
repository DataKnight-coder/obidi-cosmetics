"use server";

import { prisma } from "@/lib/prisma";

export async function getProducts() {
  return await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { variants: true, category: true, productImages: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true, productImages: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { isFeatured: true, status: "ACTIVE" },
    take: 4,
    include: { variants: true, category: true, productImages: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getNewArrivals() {
  return await prisma.product.findMany({
    where: { isNewArrival: true, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { variants: true, category: true, productImages: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function searchProducts(query: string) {
  return await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { category: { is: { name: { contains: query } } } },
      ],
    },
    include: { variants: true, category: true, productImages: { orderBy: { sortOrder: 'asc' } } },
  });
}
