import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { name: "Makeup", note: "Colour that shows up", image: "/assets/makeup.png" },
  { name: "Skincare", note: "Rituals for your glow", image: "/assets/skincare.png" },
  { name: "Hair care", note: "Love every texture", image: "/assets/haircare.png" },
  { name: "Fragrance", note: "Leave an impression", image: "/assets/fragrance.png" },
];

export default function CategoryGrid() {
  return (
    <section id="categories" className="section-shell scroll-mt-28 py-16 sm:py-24">
      <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-primary">Find your ritual</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] text-on-surface sm:text-6xl">
            Beauty for every mood.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-on-surface-variant sm:text-base">
          Start with what you love. Each collection is curated to make discovering your next favourite beautifully simple.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className={`group relative overflow-hidden rounded-[2rem] ${index % 2 === 0 ? "lg:mt-0" : "lg:mt-10"}`}
          >
            <div className="relative aspect-[4/5] min-h-[360px]">
              <Image
                src={category.image}
                alt={`${category.name} collection`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f0c13]/90 via-[#1f0c13]/10 to-transparent" />
              <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/10 text-xs font-bold text-white backdrop-blur-md">
                0{index + 1}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-white">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{category.name}</h3>
                  <p className="mt-1 text-sm text-white/70">{category.note}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#241218] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
