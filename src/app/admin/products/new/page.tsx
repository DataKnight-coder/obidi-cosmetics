import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  await requireRole(["SUPER_ADMIN", "CATALOG_MANAGER"]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <NewProductForm categories={categories} />;
}
