"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-surface-container-lowest border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-headline-lg text-2xl flex items-center gap-3">
            <ShoppingBag className="text-primary" /> Your Cart
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant gap-4">
              <ShoppingBag size={64} className="opacity-20" />
              <p className="font-body-lg">Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="text-primary hover:underline font-label-sm uppercase tracking-widest mt-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 glass-card p-4 rounded-2xl">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/20">
                  <Image src={item.featuredImage} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-lg text-lg line-clamp-2 pr-4">{item.name}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="hover:text-primary transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body-md w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="hover:text-primary transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-body-lg font-bold text-primary">₦{(item.priceKobo * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-surface-container/50 backdrop-blur-md flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-body-lg text-on-surface-variant">Subtotal</span>
              <span className="font-display-lg text-2xl">₦{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-on-surface-variant text-center">Shipping & taxes calculated at checkout</p>
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-sm px-8 py-4 rounded-full uppercase tracking-widest text-center shadow-[0_10px_20px_rgba(255,72,151,0.3)] hover:scale-105 transition-transform"
            >
              Checkout Now
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
