"use client";

import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNairaFromKobo } from "@/lib/money";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-50 bg-[#160b10]/65 backdrop-blur-sm" onClick={closeCart} aria-hidden="true" />}

      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full transform flex-col border-l border-primary/10 bg-surface text-on-surface shadow-2xl transition-transform duration-300 ease-in-out sm:w-[450px] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-6">
          <h2 className="flex items-center gap-3 font-headline-lg text-2xl font-bold"><ShoppingBag className="text-primary" />Your cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 transition-colors hover:bg-primary/10 hover:text-primary"><X size={22} /></button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-on-surface-variant">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-fixed"><ShoppingBag size={42} className="text-primary opacity-70" /></span>
              <p className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-on-surface">Your bag is waiting.</p>
              <p className="max-w-xs text-sm leading-6">Add something beautiful and it will appear right here.</p>
              <button type="button" onClick={closeCart} className="mt-3 rounded-full bg-on-surface px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-background">Continue shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-primary/10 bg-surface-container-low p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  <Image src={item.featuredImage} alt={item.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 pr-2 font-headline-lg text-base font-bold">{item.name}</h3>
                    <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="p-1 text-on-surface-variant transition-colors hover:text-error"><X size={16} /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 rounded-full bg-surface px-3 py-1.5">
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-primary"><Minus size={14} /></button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-primary"><Plus size={14} /></button>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatNairaFromKobo(item.priceKobo * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-outline-variant bg-surface-container-low/70 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between"><span className="text-on-surface-variant">Subtotal</span><span className="font-display text-2xl font-bold">{formatNairaFromKobo(total)}</span></div>
            <p className="text-center text-xs text-on-surface-variant">Shipping and taxes are calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart} className="rounded-full bg-primary px-8 py-4 text-center font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-primary shadow-[0_12px_30px_rgba(141,33,77,0.2)] transition-transform hover:-translate-y-1">Checkout now</Link>
          </div>
        )}
      </aside>
    </>
  );
}
