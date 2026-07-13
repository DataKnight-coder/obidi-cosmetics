"use client";

import Link from "next/link";
import { Search, Heart, User, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { openCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="flex flex-col bg-surface/10 dark:bg-surface/10 backdrop-blur-xl sticky top-0 w-full z-50 shadow-2xl border-b border-white/10">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-container-max mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display-lg text-2xl md:text-3xl italic font-black text-primary dark:text-surface-tint">
            OBIDI COSMETICS
          </Link>
        </div>
        {/* Links */}
        <div className="hidden md:flex items-center gap-6 font-label-sm text-[10px] uppercase tracking-widest text-primary dark:text-primary-fixed">
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/shop">Shop</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/categories">Categories</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/new-arrivals">New Arrivals</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/best-sellers">Best Sellers</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/journal">Beauty Journal</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-lg" href="/about">About Us</Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 text-primary dark:text-primary-fixed">
          <form action="/search" className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:border-primary/50 transition-colors mr-2">
            <input 
              type="text" 
              name="q"
              placeholder="Search products..." 
              className="bg-transparent text-sm text-on-surface outline-none w-32 focus:w-48 transition-all"
            />
            <button type="submit" className="text-on-surface-variant hover:text-primary ml-2">
              <Search size={18} />
            </button>
          </form>

          <button className="hidden md:flex scale-95 active:scale-90 transition-transform duration-200 hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-full items-center justify-center">
            <Heart size={24} />
          </button>
          <button className="hidden md:flex scale-95 active:scale-90 transition-transform duration-200 hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-full items-center justify-center">
            <User size={24} />
          </button>
          <button onClick={openCart} className="scale-95 active:scale-90 transition-transform duration-200 hover:backdrop-blur-3xl hover:bg-white/5 p-2 rounded-full flex items-center justify-center relative">
            <ShoppingBag size={24} />
            {mounted && cartItemCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
