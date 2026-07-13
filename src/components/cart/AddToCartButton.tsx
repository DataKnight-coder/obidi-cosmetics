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
        className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-sm px-8 py-5 rounded-full uppercase tracking-widest shadow-[0_10px_20px_rgba(255,72,151,0.3)] hover:scale-105 transition-transform mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
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
      className="bg-white/10 hover:bg-primary text-primary hover:text-on-primary rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50"
    >
      <ShoppingCart size={20} />
    </button>
  );
}
