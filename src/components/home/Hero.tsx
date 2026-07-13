import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="section-shell py-7 sm:py-10 lg:py-14">
      <div className="grid min-h-[680px] overflow-hidden rounded-[2rem] bg-[#2a111a] lg:grid-cols-12 lg:rounded-[3rem]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-14 text-[#fff8fa] sm:px-10 lg:col-span-5 lg:px-14 lg:py-20 xl:px-20">
          <div className="mb-8 flex w-max items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <Star size={13} className="fill-[#e5bd78] text-[#e5bd78]" />
            <span className="eyebrow text-[#f0cfd9]">Curated beauty, made for us</span>
          </div>

          <h1 className="max-w-3xl font-display text-[clamp(3.2rem,6.8vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.075em]">
            Beauty no suppose <span className="text-[#e5bd78]">hard.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#decbd1] sm:text-lg">
            Authentic beauty, no long story. Discover skincare, makeup and fragrance selected to celebrate every shade and every version of you.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#fff8fa] px-7 py-4 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-[#2a111a] transition-transform hover:-translate-y-1"
            >
              Shop the edit <ArrowUpRight size={17} />
            </Link>
            <Link
              href="#categories"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
            >
              Explore categories <ArrowDownRight size={17} />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-5 border-t border-white/15 pt-7">
            <div><strong className="block font-display text-xl text-white">100%</strong><span className="mt-1 block text-xs text-[#c9b1ba]">Authentic</span></div>
            <div><strong className="block font-display text-xl text-white">24/7</strong><span className="mt-1 block text-xs text-[#c9b1ba]">Easy shopping</span></div>
            <div><strong className="block font-display text-xl text-white">NG</strong><span className="mt-1 block text-xs text-[#c9b1ba]">Nationwide</span></div>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden lg:col-span-7 lg:min-h-full">
          <Image
            src="/assets/makeup.png"
            alt="A curated collection of luxury makeup in rich berry and gold tones"
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a111a]/65 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#2a111a]/35 lg:via-transparent lg:to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
            <div className="max-w-[260px] rounded-3xl border border-white/25 bg-white/90 p-5 text-[#2a111a] shadow-2xl backdrop-blur-md">
              <span className="eyebrow text-primary">The OBIDI edit</span>
              <p className="mt-3 font-headline-lg text-lg font-bold leading-snug">High-impact beauty. Thoughtfully selected.</p>
            </div>
            <div className="hidden h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-[#8d214d] text-center font-label-sm text-[9px] font-bold uppercase leading-4 tracking-[0.12em] text-white shadow-xl sm:flex">
              Glow<br />your way
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
