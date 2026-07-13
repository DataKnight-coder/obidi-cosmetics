import { CheckCircle, Lock, Truck, Headset } from "lucide-react";

export default function TrustBar() {
  return (
    <section className="w-full border-y border-white/5 bg-white/5 py-6 backdrop-blur-md waka-item mb-stack-lg" style={{ animationDelay: '0.5s' }}>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-wrap justify-between items-center gap-4 text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase text-center">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="text-primary" size={32} /> 
          Authentic Products
        </div>
        <div className="flex flex-col items-center gap-2">
          <Lock className="text-primary" size={32} /> 
          Secure Checkout
        </div>
        <div className="flex flex-col items-center gap-2">
          <Truck className="text-primary" size={32} /> 
          Nationwide Delivery
        </div>
        <div className="flex flex-col items-center gap-2">
          <Headset className="text-primary" size={32} /> 
          Responsive Support
        </div>
      </div>
    </section>
  );
}
