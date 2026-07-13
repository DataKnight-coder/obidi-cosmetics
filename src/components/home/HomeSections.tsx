import Image from "next/image";
import Link from "next/link";
import { PlayCircle, CheckCircle, ChevronDown, Heart, Recycle, Users, FlaskConical } from "lucide-react";

export function BeautyReels() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item bg-white/5 my-stack-lg rounded-[40px]">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center text-primary">Beauty Reels</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {["fragrance.png", "makeup.png", "skincare.png", "haircare.png"].map((img, idx) => (
          <div key={idx} className="min-w-[200px] h-[350px] bg-black rounded-2xl relative flex-shrink-0 snap-center overflow-hidden group cursor-pointer">
            <Image className="object-cover opacity-60 group-hover:scale-105 transition-transform" src={`/assets/${img}`} alt="Reel" fill sizes="200px" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="text-white drop-shadow-lg" size={48} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Spotlight() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <div className="glass-card rounded-[40px] overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 relative min-h-[400px]">
          <Image className="object-cover" src="/assets/fragrance.png" alt="Spotlight" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="font-display-lg text-4xl text-primary mb-4">Spotlight: Lagos Sun Serum</h2>
          <p className="font-body-lg text-on-surface-variant mb-6">A hydration powerhouse. We formulated it with niacinamide and hyaluronic acid to lock in moisture and deliver a ridiculous glow.</p>
          <ul className="flex flex-col gap-3 mb-8 text-on-surface">
            <li className="flex items-center gap-2"><CheckCircle className="text-primary" size={20} /> 5% Niacinamide</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-primary" size={20} /> Hyaluronic Acid</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-primary" size={20} /> Non-comedogenic</li>
          </ul>
          <Link href="/products/lagos-sun-serum" className="bg-primary text-on-primary font-label-sm px-8 py-4 rounded-full uppercase tracking-widest w-max shadow-lg hover:scale-105 transition-transform text-center">Shop The Spotlight</Link>
        </div>
      </div>
    </section>
  );
}

export function BundleSave() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center">Bundle &amp; Save</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-3xl p-6 text-center border border-primary/20 hover:border-primary/50 transition-colors">
          <h3 className="font-headline-lg text-2xl text-primary mb-2">Beginner Kit</h3>
          <p className="font-body-md text-on-surface-variant mb-4">Everything you need to start.</p>
          <div className="text-2xl font-bold mb-6">₦45,000 <span className="text-sm line-through text-on-surface-variant/50">₦55,000</span></div>
          <button className="w-full bg-white/10 hover:bg-primary text-primary hover:text-on-primary py-3 rounded-full transition-colors font-label-sm uppercase tracking-widest">Add to Cart</button>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center border border-primary/50 relative transform md:-translate-y-4 shadow-[0_10px_30px_rgba(255,72,151,0.2)]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs px-4 py-1 rounded-full uppercase tracking-widest font-bold">Best Value</div>
          <h3 className="font-headline-lg text-2xl text-primary mb-2">Skincare Routine</h3>
          <p className="font-body-md text-on-surface-variant mb-4">The ultimate 5-step system.</p>
          <div className="text-2xl font-bold mb-6">₦85,000 <span className="text-sm line-through text-on-surface-variant/50">₦100,000</span></div>
          <button className="w-full bg-primary text-on-primary py-3 rounded-full transition-colors font-label-sm uppercase tracking-widest shadow-lg">Add to Cart</button>
        </div>
        <div className="glass-card rounded-3xl p-6 text-center border border-primary/20 hover:border-primary/50 transition-colors">
          <h3 className="font-headline-lg text-2xl text-primary mb-2">Bridal Kit</h3>
          <p className="font-body-md text-on-surface-variant mb-4">Flawless glow for your big day.</p>
          <div className="text-2xl font-bold mb-6">₦120,000 <span className="text-sm line-through text-on-surface-variant/50">₦150,000</span></div>
          <button className="w-full bg-white/10 hover:bg-primary text-primary hover:text-on-primary py-3 rounded-full transition-colors font-label-sm uppercase tracking-widest">Add to Cart</button>
        </div>
      </div>
    </section>
  );
}

export function WhyShopWithUs() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item bg-white/5 my-stack-lg rounded-[40px]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Heart size={32} />
          </div>
          <h3 className="font-headline-lg text-lg">Cruelty Free</h3>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Recycle size={32} />
          </div>
          <h3 className="font-headline-lg text-lg">Eco Packaging</h3>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Users size={32} />
          </div>
          <h3 className="font-headline-lg text-lg">Inclusive Shades</h3>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <FlaskConical size={32} />
          </div>
          <h3 className="font-headline-lg text-lg">Dermatologist Tested</h3>
        </div>
      </div>
    </section>
  );
}

export function MeetTheBrand() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item text-center max-w-3xl">
      <h2 className="font-display-lg text-4xl text-primary mb-8 uppercase tracking-widest">Meet the Brand</h2>
      <div className="glass-card p-8 md:p-12 rounded-[40px] border border-primary/20 text-left md:text-center shadow-[0_10px_30px_rgba(255,72,151,0.1)]">
        <p className="font-headline-lg text-2xl md:text-3xl text-on-surface mb-6">People always ask us,</p>
        <p className="font-display-lg text-3xl md:text-5xl text-primary italic mb-10 leading-tight">
            &quot;See your house, why you still dey waka?&quot;
        </p>
        <p className="font-body-lg text-on-surface-variant text-xl mb-8 font-bold">Simple.</p>
        <ul className="font-body-lg text-on-surface-variant text-lg md:text-xl space-y-4 mb-10 inline-flex flex-col text-left">
            <li className="flex items-center gap-3"><CheckCircle className="text-primary" size={24} /> We're still looking for better beauty products.</li>
            <li className="flex items-center gap-3"><FlaskConical className="text-primary" size={24} /> Still testing.</li>
            <li className="flex items-center gap-3"><CheckCircle className="text-primary" size={24} /> Still learning.</li>
            <li className="flex items-center gap-3"><CheckCircle className="text-primary" size={24} /> Still curating.</li>
            <li className="flex items-center gap-3"><CheckCircle className="text-primary" size={24} /> Still refusing to sell products we wouldn't recommend to our own people.</li>
        </ul>
        <p className="font-headline-lg text-2xl text-on-surface">That's why we're still waka.</p>
      </div>
    </section>
  );
}

export function FAQAccordion() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item max-w-3xl">
      <h2 className="font-headline-lg text-headline-lg mb-8 text-center">Frequently Asked Questions</h2>
      <div className="flex flex-col gap-4">
        <details className="glass-card rounded-xl p-4 group cursor-pointer">
          <summary className="font-headline-lg text-lg flex justify-between items-center outline-none">
            Do you ship internationally?
            <ChevronDown className="group-open:rotate-180 transition-transform" />
          </summary>
          <p className="font-body-md text-on-surface-variant mt-4">Currently, we ship nationwide within Nigeria. International shipping is coming soon.</p>
        </details>
        <details className="glass-card rounded-xl p-4 group cursor-pointer">
          <summary className="font-headline-lg text-lg flex justify-between items-center outline-none">
            Are your products cruelty-free?
            <ChevronDown className="group-open:rotate-180 transition-transform" />
          </summary>
          <p className="font-body-md text-on-surface-variant mt-4">Yes, 100%. We never test on animals.</p>
        </details>
        <details className="glass-card rounded-xl p-4 group cursor-pointer">
          <summary className="font-headline-lg text-lg flex justify-between items-center outline-none">
            How do I find my shade?
            <ChevronDown className="group-open:rotate-180 transition-transform" />
          </summary>
          <p className="font-body-md text-on-surface-variant mt-4">Use our virtual try-on tool or hit up our WhatsApp support for a personalized consultation.</p>
        </details>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item text-center">
      <div className="glass-card rounded-[40px] p-12 max-w-3xl mx-auto bg-gradient-to-b from-primary/10 to-transparent">
        <h2 className="font-display-lg text-4xl text-primary mb-4">Don't Carry Last.</h2>
        <p className="font-body-md text-on-surface-variant mb-8">Get beauty tips, exclusive launches, and special offers delivered to your inbox.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg mx-auto justify-center items-center">
          <input aria-label="Email address" className="bg-surface-variant/50 border border-primary/30 focus:border-primary outline-none w-full text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 px-6 py-3 rounded-full text-center md:text-left text-lg transition-colors" placeholder="Enter your email" type="email" />
          <button aria-label="Join the Glow Gang" className="bg-gradient-to-r from-primary-container to-secondary-container text-on-primary whitespace-nowrap px-8 py-3 rounded-full font-label-sm uppercase tracking-widest shadow-[0_0_15px_rgba(255,72,151,0.4)] hover:shadow-[0_0_25px_rgba(255,72,151,0.6)] hover:scale-105 transition-all w-full md:w-auto">
            Join the Glow Gang
          </button>
        </div>
      </div>
    </section>
  );
}

export function FeaturedBrands() {
  return (
    <section className="w-full overflow-hidden py-8 bg-white/5 waka-item my-8">
      <div className="flex items-center justify-around opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="font-display-lg text-2xl font-bold">VOGUE</span>
        <span className="font-display-lg text-2xl font-bold">ELLE</span>
        <span className="font-display-lg text-2xl font-bold">GLAMOUR</span>
        <span className="font-display-lg text-2xl font-bold">ALLURE</span>
      </div>
    </section>
  );
}
