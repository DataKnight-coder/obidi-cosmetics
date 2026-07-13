import Image from "next/image";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getNewArrivals } from "@/data/products";
import Link from "next/link";

export default async function NewArrivals() {
  const products = await getNewArrivals();

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md flex items-center gap-4">
        New Arrivals <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">✨ Just Dropped</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
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
            </div>
            <div className="p-6 flex flex-col gap-2">
              <h3 className="font-headline-lg text-2xl text-primary">{product.name}</h3>
              <p className="font-body-md text-on-surface-variant line-clamp-2">{product.shortDescription || product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-body-lg font-bold text-on-surface">₦{Number(product.variants[0].priceKobo).toLocaleString()}</span>
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
  );
}
