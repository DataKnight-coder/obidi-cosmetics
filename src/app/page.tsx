import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import EditorPicks from "@/components/home/EditorPicks";
import ShopBySkinConcern from "@/components/home/ShopBySkinConcern";
import ShopByLook from "@/components/home/ShopByLook";
import { 
  BeautyReels, 
  Spotlight, 
  BundleSave, 
  WhyShopWithUs, 
  MeetTheBrand, 
  FeaturedBrands, 
  FAQAccordion, 
  Newsletter 
} from "@/components/home/HomeSections";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

function BeautyJournal() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center text-primary">Beauty Journal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group cursor-pointer">
          <div className="h-48 rounded-2xl overflow-hidden mb-4 relative">
            <Image className="object-cover group-hover:scale-105 transition-transform duration-500" src="/assets/makeup.png" alt="Journal" fill sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
          <h3 className="font-headline-lg text-xl mb-2 group-hover:text-primary transition-colors">How to Layer Active Ingredients</h3>
          <p className="font-body-md text-on-surface-variant text-sm">Don't mix these two acids.</p>
        </div>
        <div className="group cursor-pointer">
          <div className="h-48 rounded-2xl overflow-hidden mb-4 relative">
            <Image className="object-cover group-hover:scale-105 transition-transform duration-500" src="/assets/skincare.png" alt="Journal" fill sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
          <h3 className="font-headline-lg text-xl mb-2 group-hover:text-primary transition-colors">The Perfect Red Lip for Dark Skin</h3>
          <p className="font-body-md text-on-surface-variant text-sm">Find your undertone match.</p>
        </div>
        <div className="group cursor-pointer">
          <div className="h-48 rounded-2xl overflow-hidden mb-4 relative">
            <Image className="object-cover group-hover:scale-105 transition-transform duration-500" src="/assets/haircare.png" alt="Journal" fill sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
          <h3 className="font-headline-lg text-xl mb-2 group-hover:text-primary transition-colors">Morning Routine in 5 Mins</h3>
          <p className="font-body-md text-on-surface-variant text-sm">For the girl on the go.</p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <main className="w-full pt-8 pb-[100px] md:pb-0">
        <Hero />
        <TrustBar />
        <CategoryGrid />
        <FeaturedCollections />
        <NewArrivals />
        <EditorPicks />
        <ShopBySkinConcern />
        <ShopByLook />
        <BeautyReels />
        <Spotlight />
        <BundleSave />
        <WhyShopWithUs />
        <MeetTheBrand />
        <FeaturedBrands />
        <BeautyJournal />
        <FAQAccordion />
        <Newsletter />
        {/* Social Gallery */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
          <h2 className="font-headline-lg text-headline-lg mb-8 text-center text-primary">#OBIDIGLOW</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative w-full aspect-square"><Image className="object-cover rounded-xl hover:opacity-80 transition-opacity cursor-pointer" src="/assets/fragrance.png" alt="Gallery" fill sizes="25vw"/></div>
            <div className="relative w-full aspect-square"><Image className="object-cover rounded-xl hover:opacity-80 transition-opacity cursor-pointer" src="/assets/makeup.png" alt="Gallery" fill sizes="25vw"/></div>
            <div className="relative w-full aspect-square"><Image className="object-cover rounded-xl hover:opacity-80 transition-opacity cursor-pointer" src="/assets/skincare.png" alt="Gallery" fill sizes="25vw"/></div>
            <div className="relative w-full aspect-square"><Image className="object-cover rounded-xl hover:opacity-80 transition-opacity cursor-pointer" src="/assets/haircare.png" alt="Gallery" fill sizes="25vw"/></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
