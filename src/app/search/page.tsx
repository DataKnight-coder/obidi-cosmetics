import { Prisma } from "@/generated/prisma/client";

type SearchResult = Prisma.ProductGetPayload<{ include: { variants: true; productImages: true; category: true } }>;
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().trim().min(2).max(100),
  page: z.coerce.number().int().min(1).default(1),
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const result = searchSchema.safeParse(await searchParams);

  if (!result.success) {
    return (
      <main className="min-h-screen py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl">
          <p className="text-on-surface-variant text-xl mb-4">Invalid search query.</p>
          <p className="text-sm">Please ensure your search term is between 2 and 100 characters.</p>
        </div>
      </main>
    );
  }

  const { q: query, page } = result.data;
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const where = {
    status: "ACTIVE",
    OR: [
      { name: { contains: query } },
      { shortDescription: { contains: query } },
      { description: { contains: query } },
      { brand: { contains: query } },
      { category: { is: { name: { contains: query } } } },
    ],
  };

  const [products, totalResults] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, productImages: true, category: true },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <main className="min-h-screen py-16 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-display-lg text-4xl mb-2">Search Results</h1>
        <p className="text-on-surface-variant">
          Showing results for <span className="text-primary">"{query}"</span> ({totalResults})
        </p>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-4">
              {page > 1 && (
                <a href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`} className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                  Previous
                </a>
              )}
              <span className="px-6 py-2">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <a href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`} className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                  Next
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl">
          <p className="text-on-surface-variant text-xl mb-4">No products found for "{query}".</p>
          <p className="text-sm">Try using more generic keywords or browse our categories.</p>
        </div>
      )}
    </main>
  );
}
