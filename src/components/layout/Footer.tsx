"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Camera, Search, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Footer() {
  const openCart = useCartStore((state) => state.openCart);

  return (
    <>
      <footer className="mt-10 bg-[#180b10] text-[#f8edf1]">
        <div className="section-shell grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr]">
          <div className="max-w-sm">
            <Link href="/" className="block max-w-sm font-display text-3xl font-extrabold uppercase leading-[0.94] tracking-[-0.055em]">OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS</Link>
            <p className="mt-5 text-sm leading-6 text-white/60">Authentic beauty, thoughtfully curated for every shade, every mood and every version of you.</p>
            <p className="mt-7 font-display text-xl font-bold tracking-[-0.04em] text-[#e5bd78]">Beauty no suppose hard.</p>
          </div>

          <div>
            <h2 className="eyebrow text-[#e5bd78]">Explore</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link className="hover:text-white" href="/shop">Shop all</Link>
              <Link className="hover:text-white" href="/#categories">Categories</Link>
              <Link className="hover:text-white" href="/#new-arrivals">New arrivals</Link>
              <Link className="hover:text-white" href="/#journal">Beauty journal</Link>
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-[#e5bd78]">About</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <Link className="hover:text-white" href="/#our-story">Our story</Link>
              <Link className="hover:text-white" href="/search">Find a product</Link>
              <Link className="hover:text-white" href="/checkout">Checkout</Link>
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-[#e5bd78]">Stay connected</h2>
            <p className="mt-5 text-sm leading-6 text-white/60">Follow the journey and share your glow.</p>
            <div className="mt-5 flex gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75" aria-label="Social updates"><Camera size={18} /></span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="section-shell flex flex-col gap-3 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS. All rights reserved.</p>
            <p>Curated with care in Nigeria.</p>
          </div>
        </div>
      </footer>

      <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-primary/15 bg-surface text-primary shadow-lg transition-transform hover:-translate-y-1 sm:flex">
        <ArrowUp size={18} />
      </button>

      <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-around rounded-full border border-primary/10 bg-surface/95 p-2 shadow-[0_20px_60px_rgba(56,22,35,0.2)] backdrop-blur-xl sm:hidden" aria-label="Quick navigation">
        <Link href="/shop" className="flex min-w-20 flex-col items-center gap-1 rounded-full py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><Search size={19} />Shop</Link>
        <Link href="/" aria-label="OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS home" className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-surface bg-on-surface shadow-md">
          <Image src="/assets/obidi logo.jpg" alt="" fill sizes="48px" className="object-cover" />
        </Link>
        <button type="button" onClick={openCart} className="flex min-w-20 flex-col items-center gap-1 rounded-full py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><ShoppingBag size={19} />Cart</button>
      </nav>
    </>
  );
}
