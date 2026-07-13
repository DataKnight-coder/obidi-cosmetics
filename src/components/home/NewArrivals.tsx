import { getNewArrivals } from "@/data/products";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function NewArrivals() {
  const products = await getNewArrivals();

  return (
    <section id="new-arrivals" className="section-shell scroll-mt-28 py-16 sm:py-24">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-primary">Freshly curated</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.055em] text-on-surface sm:text-6xl">New arrivals</h2>
        </div>
        <Link href="/shop" className="hidden items-center gap-2 border-b border-primary pb-1 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-primary sm:flex">
          Shop all <ArrowRight size={15} />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="editorial-card flex min-h-56 flex-col items-center justify-center rounded-[2rem] px-6 text-center">
          <p className="font-display text-2xl font-bold tracking-[-0.04em]">Something beautiful is coming.</p>
          <p className="mt-2 text-sm text-on-surface-variant">Our next edit is being curated right now.</p>
          <Link href="/shop" className="mt-6 rounded-full bg-on-surface px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-background">Explore the shop</Link>
        </div>
      )}
    </section>
  );
}
