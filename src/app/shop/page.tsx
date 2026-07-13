import { getProducts } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

export const metadata = {
  title: "Shop All Products - OBIDI COSMETICS",
  description: "Browse our entire collection of premium cosmetics designed for your skin tone.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="w-full pt-16 pb-32">
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="text-center mb-16">
          <h1 className="font-display-xl text-5xl md:text-6xl text-primary mb-4">Shop All</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Discover our full range of unapologetic luxury beauty products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {products.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.id} className="glass-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="h-80 relative overflow-hidden">
                <Image 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  src={product.featuredImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {product.isNewArrival && (
                  <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold z-10">
                    New
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col gap-2">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">{product.category?.name || 'Category'}</p>
                <h3 className="font-headline-lg text-xl text-primary">{product.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex flex-col">
                    {Number(product.variants[0].discountPriceKobo) ? (
                      <>
                        <span className="font-body-lg font-bold text-primary">₦{Number(product.variants[0].discountPriceKobo).toLocaleString()}</span>
                        <span className="text-xs line-through text-on-surface-variant">₦{Number(product.variants[0].priceKobo).toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="font-body-lg font-bold text-on-surface">₦{Number(product.variants[0].priceKobo).toLocaleString()}</span>
                    )}
                  </div>
                  <AddToCartButton 
                    product={{
                      id: product.variants[0].id,
                      name: product.name,
                      slug: product.slug,
                      priceKobo: Number(product.variants[0].discountPriceKobo) || Number(product.variants[0].priceKobo),
                      featuredImage: product.featuredImage
                    }} 
                    disabled={product.variants[0].stockQuantity === 0}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
