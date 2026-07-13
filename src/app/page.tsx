export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import Footer from "@/components/layout/Footer";

const values = [
  { icon: ShieldCheck, title: "Carefully selected", text: "No random shelf fillers. Every product earns its place." },
  { icon: Heart, title: "Made with you in mind", text: "Beauty that understands our skin, shades and routines." },
  { icon: Leaf, title: "Better choices", text: "Thoughtful formulas, honest guidance and less beauty confusion." },
];

const journal = [
  { title: "Your five-minute glow routine", category: "Skin school", image: "/assets/skincare.png" },
  { title: "How to choose a lip that loves your undertone", category: "Makeup notes", image: "/assets/makeup.png" },
  { title: "Finding a fragrance that feels like you", category: "Scent stories", image: "/assets/fragrance.png" },
];

function BrandStory() {
  return (
    <section id="our-story" className="section-shell scroll-mt-28 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] bg-[#2a111a] sm:rounded-[3rem]">
          <Image src="/assets/fragrance.png" alt="Luxury fragrance selected by OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a111a]/80 via-transparent to-transparent" />
          <div className="absolute inset-x-7 bottom-7 text-white sm:inset-x-10 sm:bottom-10">
            <Sparkles className="mb-4 text-[#e5bd78]" size={25} />
            <p className="max-w-sm font-display text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">Still looking. Still learning. Still curating better.</p>
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">Why we still dey waka</p>
          <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.8rem,5vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.065em] text-on-surface">
            Beauty should feel like confidence—not homework.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-7 text-on-surface-variant sm:text-lg">
            OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS exists to make great beauty easier to find. We test, learn and curate so you can shop with clarity, discover what works, and enjoy the ritual.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t border-primary/25 pt-5">
                <Icon size={21} className="text-primary" />
                <h3 className="mt-4 font-headline-lg text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BeautyJournal() {
  return (
    <section id="journal" className="section-shell scroll-mt-28 py-16 sm:py-24">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-primary">Beauty, explained</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">The journal</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-on-surface-variant">Useful guidance, honest opinions and no unnecessary beauty grammar.</p>
      </div>

      <div className="grid gap-7 md:grid-cols-3">
        {journal.map((article, index) => (
          <article key={article.title} className="group">
            <div className={`relative overflow-hidden rounded-[1.75rem] ${index === 1 ? "aspect-[4/5] md:-mt-7" : "aspect-[4/5]"}`}>
              <Image src={article.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-2 font-label-sm text-[9px] font-bold uppercase tracking-[0.16em] text-primary backdrop-blur-sm">{article.category}</span>
            </div>
            <div className="flex items-start justify-between gap-4 px-1 pt-5">
              <h3 className="max-w-xs font-headline-lg text-xl font-bold leading-tight sm:text-2xl">{article.title}</h3>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary"><ArrowUpRight size={17} /></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FAQAndNewsletter() {
  return (
    <section className="section-shell py-16 sm:py-24">
      <div className="grid overflow-hidden rounded-[2rem] bg-[#211017] text-white lg:grid-cols-2 lg:rounded-[3rem]">
        <div className="p-7 sm:p-12 lg:p-16">
          <p className="eyebrow text-[#e5bd78]">Need to know</p>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">Questions, answered.</h2>
          <div className="mt-9 divide-y divide-white/15">
            {[
              ["Do you deliver nationwide?", "Yes. We deliver across Nigeria, with delivery timing shown during checkout."],
              ["Are your products authentic?", "Always. Authenticity is non-negotiable, and every product is selected from trusted sources."],
              ["Can you help me choose?", "Absolutely. Reach out to our support team for personalised product guidance."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-headline-lg text-base font-bold sm:text-lg">
                  {question}<ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={19} />
                </summary>
                <p className="max-w-md pt-3 text-sm leading-6 text-white/65">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center bg-primary p-7 sm:p-12 lg:p-16">
          <p className="eyebrow text-primary-fixed">Join the glow list</p>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-none tracking-[-0.055em] sm:text-6xl">Don&apos;t carry last.</h2>
          <p className="mt-5 max-w-md leading-7 text-on-primary/75">New drops, useful beauty notes and special offers—sent with taste, never noise.</p>
          <form className="mt-9 flex flex-col gap-3 sm:flex-row" action="#">
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email address" className="min-h-[54px] min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-6 text-sm text-white placeholder:text-white/60 focus:border-white" />
            <button type="submit" className="min-h-[54px] rounded-full bg-white px-7 font-label-sm text-xs font-bold uppercase tracking-[0.14em] text-primary transition-transform hover:-translate-y-1">Join the list</button>
          </form>
          <p className="mt-4 text-xs text-on-primary/55">By joining, you agree to receive OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS updates.</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrustBar />
        <CategoryGrid />
        <FeaturedCollections />
        <NewArrivals />
        <BrandStory />
        <BeautyJournal />
        <FAQAndNewsletter />
      </main>
      <Footer />
    </>
  );
}
