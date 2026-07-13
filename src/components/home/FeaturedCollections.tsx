import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FeaturedCollections() {
  return (
    <section id="collections" className="section-shell py-12 sm:py-20">
      <div className="grid overflow-hidden rounded-[2rem] bg-primary lg:grid-cols-2 lg:rounded-[3rem]">
        <div className="relative min-h-[440px] lg:min-h-[680px]">
          <Image
            src="/assets/skincare.png"
            alt="Rose gold skincare serum"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-6 left-6 rounded-full border border-white/30 bg-black/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:bottom-10 sm:left-10">
            Skin first, glow follows
          </span>
        </div>

        <div className="flex flex-col justify-center px-7 py-14 text-on-primary sm:px-12 lg:px-16 xl:px-20">
          <p className="eyebrow text-primary-fixed">The glow edit</p>
          <h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,5.7rem)] font-extrabold leading-[0.92] tracking-[-0.065em]">
            Your skin, only more luminous.
          </h2>
          <p className="mt-7 max-w-lg text-base leading-7 text-on-primary/75 sm:text-lg">
            Build a routine that feels luxurious and works beautifully. Hydration, clarity and radiance—curated without the confusion.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3 border-y border-white/20 py-6 text-center">
            <div><span className="block font-display text-2xl font-bold">01</span><span className="mt-1 block text-xs text-white/65">Cleanse</span></div>
            <div><span className="block font-display text-2xl font-bold">02</span><span className="mt-1 block text-xs text-white/65">Treat</span></div>
            <div><span className="block font-display text-2xl font-bold">03</span><span className="mt-1 block text-xs text-white/65">Protect</span></div>
          </div>

          <Link href="/shop?category=Skincare" className="mt-9 inline-flex w-max items-center gap-2 rounded-full bg-on-primary px-7 py-4 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-primary transition-transform hover:-translate-y-1">
            Shop skincare <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
