export const dynamic = "force-dynamic";
import { getProducts } from "@/data/products";
import ProductCard from "@/components/shop/ProductCard";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Shop All Products | OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS",
  description: "Browse authentic makeup, skincare, hair care and fragrance curated by OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <main className="pb-24">
        <section className="section-shell py-12 sm:py-20">
          <div className="rounded-[2rem] bg-[#211017] px-7 py-14 text-white sm:px-12 sm:py-20 lg:rounded-[3rem] lg:px-20">
            <p className="eyebrow text-[#e5bd78]">The full Waka edit</p>
            <div className="mt-5 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <h1 className="max-w-3xl font-display text-[clamp(3.4rem,7vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.07em]">Shop beauty, your way.</h1>
              <p className="max-w-md text-base leading-7 text-white/65">Authentic skincare, makeup, hair care and fragrance—selected to make choosing beautifully simple.</p>
            </div>
          </div>
        </section>

        <section className="section-shell py-10 sm:py-16">
          <div className="mb-9 flex items-center justify-between border-b border-outline-variant pb-5">
            <h2 className="font-headline-lg text-xl font-bold">All products</h2>
            <span className="eyebrow text-on-surface-variant">{products.length} {products.length === 1 ? "item" : "items"}</span>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="editorial-card rounded-[2rem] px-6 py-20 text-center">
              <h2 className="font-display text-3xl font-bold tracking-[-0.04em]">The shelves are being curated.</h2>
              <p className="mt-3 text-on-surface-variant">Check back soon for the next Waka edit.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
