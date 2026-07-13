import Image from "next/image";

export default function EditorPicks() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item bg-white/5 my-stack-lg rounded-[40px]">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md flex items-center gap-4 justify-center">
        Editor's Picks <span className="bg-secondary-container text-on-secondary-container text-xs px-3 py-1 rounded-full uppercase tracking-widest">👑 Team Favourite</span>
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 glass-card rounded-3xl p-8 text-center md:text-left">
          <h3 className="font-display-lg text-4xl text-primary mb-4">The Ultimate Glow Palette</h3>
          <p className="font-body-lg text-on-surface-variant mb-6">"Omo, this palette literally changed my routine. The pigment is insane. Na this one." - Head of Beauty</p>
          <button className="glass-card text-primary font-label-sm text-label-sm px-8 py-3 rounded-full uppercase tracking-widest hover:bg-white/5 transition-colors border border-primary/30">
            Shop The Palette
          </button>
        </div>
        <div className="w-full md:w-1/2 h-80 rounded-3xl overflow-hidden relative">
          <Image 
            className="object-cover" 
            src="/assets/haircare.png" 
            alt="The Ultimate Glow Palette"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
