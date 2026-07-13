"use client";

import { useCartStore, CartItem } from "@/store/useCartStore";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Omit<CartItem, "quantity">;
  variant?: "icon" | "full";
  disabled?: boolean;
}

export default function AddToCartButton({ product, variant = "icon", disabled = false }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a Link
    addItem(product);
  };

  if (variant === "full") {
    return (
      <button 
        disabled={disabled}
        onClick={handleAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-5 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-on-primary shadow-[0_12px_30px_rgba(141,33,77,0.2)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCart size={24} />
        {disabled ? "Out of Stock" : "Add to Cart"}
      </button>
    );
  }

  return (
    <button 
      disabled={disabled}
      onClick={handleAdd}
      aria-label={disabled ? "Out of stock" : `Add ${product.name} to cart`}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ShoppingCart size={20} />
    </button>
  );
}
