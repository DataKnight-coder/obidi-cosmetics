"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/#categories" },
  { label: "New arrivals", href: "/#new-arrivals" },
  { label: "Our story", href: "/#our-story" },
  { label: "Journal", href: "/#journal" },
];

export default function Navbar() {
  const { openCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-[#f8f4ef]/92 backdrop-blur-xl">
      <div className="section-shell flex h-[72px] items-center justify-between gap-5 lg:h-[82px]">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 text-on-surface transition-colors hover:bg-primary hover:text-on-primary lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" className="group flex flex-col leading-none" aria-label="OBIDI COSMETICS home">
          <span className="font-display text-2xl font-extrabold tracking-[-0.06em] text-on-surface transition-colors group-hover:text-primary sm:text-[1.7rem]">
            OBIDI
          </span>
          <span className="mt-1 font-label-sm text-[8px] font-bold uppercase tracking-[0.36em] text-primary sm:text-[9px]">
            Cosmetics
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative py-2 font-label-sm text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-primary hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="Search products"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Search size={20} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart${mounted && cartItemCount ? `, ${cartItemCount} items` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-on-surface text-background transition-transform hover:scale-105"
          >
            <ShoppingBag size={19} />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary ring-2 ring-background">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-primary/10 bg-surface px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-outline-variant py-4 font-headline-lg text-lg font-semibold text-on-surface last:border-0 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
