"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { processCheckout } from "@/actions/checkout";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    const checkoutInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      analyticsConsent: true, // TODO: capture from a real checkbox if desired
      items: items.map(i => ({
        variantId: i.id,
        quantity: i.quantity,
      })),
    };

    const res = await processCheckout(checkoutInput);
    
    if (res.success && res.url) {
      clearCart();
      router.push(res.url); // Redirect to Paystack
    } else {
      alert(res.error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display-lg text-4xl mb-4">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-8">Add some unapologetic luxury to your cart to proceed.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:scale-105 transition-transform">
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col lg:flex-row gap-12">
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-3/5">
        <Link href="/shop" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-label-sm uppercase tracking-widest">
          <ChevronLeft size={16} /> Back to Shop
        </Link>

        <h1 className="font-display-lg text-4xl mb-8">Checkout</h1>

        <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Contact Info */}
          <section className="glass-card p-6 rounded-3xl">
            <h2 className="font-headline-lg text-xl mb-4 text-primary">Contact Information</h2>
            <div className="flex flex-col gap-4">
              <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
            </div>
          </section>

          {/* Shipping Info */}
          <section className="glass-card p-6 rounded-3xl">
            <h2 className="font-headline-lg text-xl mb-4 text-primary">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
              <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
              <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" className="col-span-2 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
              <input required type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
              <input required type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-on-surface focus:border-primary outline-none transition-colors" />
            </div>
          </section>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full lg:w-2/5">
        <div className="glass-card p-8 rounded-3xl sticky top-24 border border-white/10 shadow-2xl">
          <h2 className="font-headline-lg text-2xl mb-6 flex items-center justify-between">
            Order Summary
            <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">{items.length} items</span>
          </h2>

          <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 border border-white/5">
                  <Image src={item.featuredImage} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-2 -right-2 bg-surface-lowest text-xs w-5 h-5 flex items-center justify-center rounded-full border border-white/10">{item.quantity}</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-body-lg text-sm line-clamp-1">{item.name}</span>
                </div>
                <span className="font-body-md font-bold">₦{(item.priceKobo * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 pb-4 flex flex-col gap-2">
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Subtotal</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Shipping</span>
              <span>Calculated next step</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-center">
            <span className="font-headline-lg text-xl">Total</span>
            <span className="font-display-lg text-3xl text-primary">₦{total.toLocaleString()}</span>
          </div>

          <button 
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-sm px-8 py-5 rounded-full uppercase tracking-widest shadow-[0_10px_20px_rgba(255,72,151,0.3)] hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Processing..." : (
              <>
                <Lock size={16} /> Proceed to Payment
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
