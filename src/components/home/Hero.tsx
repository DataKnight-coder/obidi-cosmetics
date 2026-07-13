import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row items-center gap-gutter min-h-[80vh]">
      <div className="w-full md:w-1/2 flex flex-col gap-stack-md waka-item" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display-xl text-display-xl text-primary leading-tight mt-8">Beauty No Suppose Hard.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
          Authentic beauty, no long story. Step into your confidence with unapologetic luxury designed for your skin tone.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <button className="bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(255,72,151,0.3)]">
            Shop Now
          </button>
          <button className="glass-card text-primary font-label-sm text-label-sm px-8 py-4 rounded-full uppercase tracking-widest hover:bg-white/5 transition-colors border border-primary/30">
            Explore Collections
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/2 relative h-[50vh] md:h-[70vh] overflow-hidden flex items-center justify-center waka-item" style={{ animationDelay: '0.3s' }}>
        <Image 
          className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,72,151,0.3)]" 
          alt="OBIDI Cosmetics Hero Logo" 
          src="/assets/obidi logo.jpg"
          fill
          priority
        />
      </div>
    </section>
  );
}
