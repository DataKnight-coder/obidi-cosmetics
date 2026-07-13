"use client";

import Link from "next/link";
import { Camera, MonitorPlay, AtSign, MessageCircle, ArrowUp, Sparkles, Store, Heart, ShoppingBag } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Elements */}
      <button 
        aria-label="WhatsApp Chat" 
        className="fixed bottom-24 md:bottom-8 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>
      <button 
        aria-label="Back to Top" 
        onClick={scrollToTop}
        className="fixed bottom-40 md:bottom-24 right-6 bg-surface-variant text-on-surface-variant p-3 rounded-full shadow-lg hover:bg-primary hover:text-on-primary transition-colors z-50 flex items-center justify-center opacity-70 hover:opacity-100"
      >
        <ArrowUp size={24} />
      </button>

      {/* Premium Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full rounded-t-[64px] mt-stack-lg border-t border-outline-variant relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop py-stack-lg max-w-container-max mx-auto text-secondary dark:text-secondary-fixed font-body-md text-body-md">
          <div className="flex flex-col gap-4">
            <span className="font-display-xl text-display-xl text-primary text-4xl">OBIDI</span>
            <p className="text-on-surface-variant text-sm">© 2024 OBIDI COSMETICS. NO CARRY LAST.</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-2">Shop</h4>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/products">All Products</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/new-arrivals">New Arrivals</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/best-sellers">Best Sellers</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/collections">Collections</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-2">Support</h4>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/shipping-returns">Shipping &amp; Returns</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/privacy-policy">Privacy Policy</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors" href="/contact">Contact Us</Link>
            <Link className="text-on-surface-variant hover:text-secondary transition-colors flex items-center gap-2" href="#">
              <MessageCircle size={14} /> WhatsApp Support
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-2">Follow Us</h4>
            <div className="flex gap-4">
              <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#"><Camera size={24} /></Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#"><MonitorPlay size={24} /></Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors" href="#"><AtSign size={24} /></Link>
            </div>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden flex justify-around items-center py-3 px-6 bg-surface-container/80 dark:bg-surface-container/80 backdrop-blur-lg text-primary dark:text-primary-fixed font-label-sm text-label-sm fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] rounded-full z-50 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <Link className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-6 py-2 animate-pulse-subtle scale-105" href="/">
          <Sparkles size={24} />
          <span>Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-all" href="/shop">
          <Store size={24} />
          <span>Shop</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-all" href="/favs">
          <Heart size={24} />
          <span>Favs</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-all" href="/cart">
          <ShoppingBag size={24} />
          <span>Cart</span>
        </Link>
      </nav>
    </>
  );
}
