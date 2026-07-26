export const dynamic = "force-dynamic";
import { getProductBySlug } from "@/data/products";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle, ShieldPlus } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";

type ProductDetails = Prisma.ProductGetPayload<{ include: { productImages: true; variants: true; category: true } }>;
import AddToCartButton from "@/components/cart/AddToCartButton";


import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found | OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS" };

  return {
    title: `${product.name} | OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: [product.featuredImage],
    },
    twitter: {
      card: "summary_large_image",
      images: [product.featuredImage],
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product: ProductDetails | null = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const images = product.productImages?.map(img => `${process.env.NEXT_PUBLIC_ASSET_BASE_URL}/${img.objectKey}`) || [];

  return (
    <main className="w-full pt-24 pb-32 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="relative w-full h-[500px] md:h-[600px] rounded-[40px] overflow-hidden glass-card">
            <Image 
              src={product.featuredImage} 
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden glass-card cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                  <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <p className="text-sm uppercase tracking-widest text-primary font-bold">{product.category?.name || 'Category'}</p>
          <h1 className="font-display-xl text-4xl md:text-5xl text-on-surface leading-tight">{product.name}</h1>
          
          <div className="flex items-end gap-4">
            {Number(product.variants[0].discountPriceKobo) ? (
              <>
                <span className="font-display-lg text-4xl text-primary">₦{Number(product.variants[0].discountPriceKobo).toLocaleString()}</span>
                <span className="font-body-lg text-xl line-through text-on-surface-variant mb-1">₦{Number(product.variants[0].priceKobo).toLocaleString()}</span>
              </>
            ) : (
              <span className="font-display-lg text-4xl text-primary">₦{Number(product.variants[0].priceKobo).toLocaleString()}</span>
            )}
          </div>

          <p className="font-body-lg text-on-surface-variant text-lg">
            {product.description}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-on-surface">
              <CheckCircle className="text-primary" size={20} />
              <span>In Stock: {product.variants[0].stockQuantity > 0 ? "Ready to ship" : "Out of stock"}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <ShieldPlus className="text-primary" size={20} />
              <span>100% Authentic Guarantee</span>
            </div>
          </div>

          <AddToCartButton 
            product={{
              id: product.variants[0].id,
              name: product.name,
              slug: product.slug,
              priceKobo: Number(product.variants[0].discountPriceKobo) || Number(product.variants[0].priceKobo),
              featuredImage: product.featuredImage
            }} 
            disabled={product.variants[0].stockQuantity === 0}
            variant="full"
          />

          {/* Accordion Info */}
          <div className="mt-8 flex flex-col gap-4">
            {product.ingredients && (
              <details className="glass-card rounded-2xl p-5 group cursor-pointer">
                <summary className="font-headline-lg text-lg outline-none">Ingredients</summary>
                <p className="font-body-md text-on-surface-variant mt-4 leading-relaxed">{product.ingredients}</p>
              </details>
            )}
            {product.usageInfo && (
              <details className="glass-card rounded-2xl p-5 group cursor-pointer">
                <summary className="font-headline-lg text-lg outline-none">How to Use</summary>
                <p className="font-body-md text-on-surface-variant mt-4 leading-relaxed">{product.usageInfo}</p>
              </details>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
