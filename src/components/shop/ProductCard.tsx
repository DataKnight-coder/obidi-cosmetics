import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatNairaFromKobo } from "@/lib/money";

type ProductCardProps = { product: Prisma.ProductGetPayload<{ include: { variants: true; productImages: true; category: true } }> };

// duplicate export removed
export default function ProductCard({ product }: ProductCardProps) {
  const variant = product.variants?.[0];
  if (!variant) return null;

  const sellingPrice = Number(variant.discountPriceKobo || variant.priceKobo);

  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface-container-low">
          <Image
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            src={product.featuredImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            {product.isNewArrival ? (
              <span className="rounded-full bg-surface px-3 py-2 font-label-sm text-[9px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm">New arrival</span>
            ) : <span />}
            <span className={`rounded-full px-3 py-2 font-label-sm text-[9px] font-bold uppercase tracking-[0.14em] ${variant.stockQuantity > 0 ? "bg-[#211017] text-white" : "bg-surface text-on-surface-variant"}`}>
              {variant.stockQuantity > 0 ? "In stock" : "Sold out"}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-4 px-1 pt-5">
        <Link href={`/products/${product.slug}`} className="min-w-0">
          <p className="eyebrow truncate text-on-surface-variant">{product.category?.name || "Beauty"}</p>
          <h3 className="mt-2 font-headline-lg text-xl font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">{product.name}</h3>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="font-headline-lg text-base font-bold text-primary">{formatNairaFromKobo(sellingPrice)}</span>
            {variant.discountPriceKobo ? (
              <span className="text-xs text-on-surface-variant line-through">{formatNairaFromKobo(Number(variant.priceKobo))}</span>
            ) : null}
          </div>
        </Link>
        <AddToCartButton
          product={{ id: variant.id, name: product.name, slug: product.slug, priceKobo: sellingPrice, featuredImage: product.featuredImage }}
          disabled={variant.stockQuantity === 0}
        />
      </div>
    </article>
  );
}
