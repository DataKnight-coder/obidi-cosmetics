import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

export default function ProductCard({ product }: { product: any }) {
  const variant = product.variants?.[0];
  if (!variant) return null;

  return (
    <Link href={`/products/${product.slug}`} className="glass-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 block">
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
        <p className="text-xs uppercase tracking-widest text-on-surface-variant">{product.category?.name || "Category"}</p>
        <h3 className="font-headline-lg text-xl text-primary">{product.name}</h3>
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            {variant.discountPriceKobo ? (
              <>
                <span className="font-body-lg font-bold text-primary">₦{Number(variant.discountPriceKobo).toLocaleString()}</span>
                <span className="text-xs line-through text-on-surface-variant">₦{Number(variant.priceKobo).toLocaleString()}</span>
              </>
            ) : (
              <span className="font-body-lg font-bold text-on-surface">₦{Number(variant.priceKobo).toLocaleString()}</span>
            )}
          </div>
          <AddToCartButton 
            product={{
              id: variant.id,
              name: product.name,
              slug: product.slug,
              priceKobo: Number(variant.discountPriceKobo || variant.priceKobo),
              featuredImage: product.featuredImage
            }} 
            disabled={variant.stockQuantity === 0}
          />
        </div>
      </div>
    </Link>
  );
}
